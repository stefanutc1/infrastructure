from __future__ import annotations

import json
import re
from typing import Any, Dict, List, Optional, Sequence, Set, Type, TypeVar, Union
from pydantic import BaseModel, ValidationError
from elo_contracts.tools import ELOToolDefinition
from .base import ToolCall

T = TypeVar("T", bound=BaseModel)


class GBNFGenerator:
    """
    Translates JSON Schemas and Pydantic models into GBNF (GGML BNF) grammar format
    for constrained decoding on local LLMs (e.g. llama.cpp, Qwen 2.5 Coder, Llama 3.2 on Apple Silicon Metal MPS).
    """

    COMMON_RULES = """
ws ::= [ \\t\\n\\r]*
number ::= ("-"? ([0-9]+) ("." [0-9]+)? ([eE] [-+]? [0-9]+)?)
integer ::= ("-"? [0-9]+)
boolean ::= ("true" | "false")
null ::= "null"
string ::= "\\"" ([^"\\\\\\x00-\\x1f] | "\\\\" (["\\\\/bfnrt] | "u" [0-9a-fA-F]{4}))* "\\""
"""

    def __init__(self) -> None:
        self.rules: Dict[str, str] = {}
        self._definitions: Dict[str, Any] = {}
        self._rule_counter: int = 0

    def generate_from_model(self, model: Type[BaseModel], root_rule_name: str = "root") -> str:
        """Generates GBNF grammar from a Pydantic model class."""
        schema = model.model_json_schema()
        return self.generate_from_schema(schema, root_rule_name=root_rule_name)

    def generate_from_schema(self, schema: Dict[str, Any], root_rule_name: str = "root") -> str:
        """Generates GBNF grammar from a JSON Schema dictionary."""
        self.rules.clear()
        self._definitions = schema.get("$defs", schema.get("definitions", {}))
        self._rule_counter = 0

        root_expr = self._process_node(schema, root_rule_name)
        self.rules[root_rule_name] = root_expr

        output_rules = []
        for name, expr in self.rules.items():
            output_rules.append(f"{name} ::= {expr}")

        grammar_str = "\n".join(output_rules) + "\n" + self.COMMON_RULES.strip()
        return grammar_str.strip()

    def generate_tool_call_grammar(
        self,
        tools: Sequence[Union[Type[BaseModel], Dict[str, Any], ELOToolDefinition]],
    ) -> str:
        """
        Generates a GBNF grammar enforcing valid structured tool calls in the format:
        {"name": "<tool_name>", "arguments": { ... }}
        """
        self.rules.clear()
        self._definitions = {}
        self._rule_counter = 0

        tool_branches: List[str] = []

        for idx, tool in enumerate(tools):
            tool_name: str
            schema: Dict[str, Any]

            if isinstance(tool, ELOToolDefinition):
                tool_name = tool.name
                schema = tool.parameters_schema
            elif isinstance(tool, type) and issubclass(tool, BaseModel):
                tool_name = tool.__name__
                schema = tool.model_json_schema()
            elif isinstance(tool, dict):
                tool_name = tool.get("name", f"tool_{idx}")
                schema = tool.get("parameters_schema") or tool.get("parameters", {})
            else:
                continue

            defs = schema.get("$defs", schema.get("definitions", {}))
            self._definitions.update(defs)

            rule_name = self._sanitize_rule_name(f"tool_args_{tool_name}")
            args_expr = self._process_node(schema, rule_name)
            self.rules[rule_name] = args_expr

            escaped_tool_name = json.dumps(tool_name)
            branch = (
                f'"\\"{{\\"" ws "\\"name\\"" ws ":" ws {escaped_tool_name} ws "," ws '
                f'"\\"arguments\\"" ws ":" ws {rule_name} ws "\\"}}"'
            )
            tool_branches.append(branch)

        if not tool_branches:
            self.rules["root"] = '"{\\"name\\": \\"\\", \\"arguments\\": {}}"'
        else:
            self.rules["root"] = " | ".join(tool_branches)

        output_rules = []
        for name, expr in self.rules.items():
            output_rules.append(f"{name} ::= {expr}")

        grammar_str = "\n".join(output_rules) + "\n" + self.COMMON_RULES.strip()
        return grammar_str.strip()

    def _process_node(self, node: Dict[str, Any], rule_hint: str) -> str:
        if "$ref" in node:
            ref_path = node["$ref"]
            ref_key = ref_path.split("/")[-1]
            ref_rule_name = self._sanitize_rule_name(f"def_{ref_key}")
            if ref_rule_name not in self.rules and ref_key in self._definitions:
                self.rules[ref_rule_name] = "null"  # placeholder to prevent infinite recursion
                resolved = self._process_node(self._definitions[ref_key], ref_rule_name)
                self.rules[ref_rule_name] = resolved
            return ref_rule_name

        if "enum" in node:
            enums = node["enum"]
            variants = [json.dumps(json.dumps(val)) for val in enums]
            return " | ".join(variants) if variants else '""'

        node_type = node.get("type")

        if node_type == "string":
            return "string"
        elif node_type == "integer":
            return "integer"
        elif node_type == "number":
            return "number"
        elif node_type == "boolean":
            return "boolean"
        elif node_type == "null":
            return "null"
        elif node_type == "array":
            items = node.get("items", {})
            item_rule = self._sanitize_rule_name(f"{rule_hint}_item")
            item_expr = self._process_node(items, item_rule)
            self.rules[item_rule] = item_expr
            return f'"[" ws ({item_rule} (ws "," ws {item_rule})*)? ws "]"'
        elif node_type == "object" or "properties" in node:
            return self._build_object_grammar(node, rule_hint)

        if "anyOf" in node:
            branches = [self._process_node(sub, f"{rule_hint}_any_{i}") for i, sub in enumerate(node["anyOf"])]
            return f"({' | '.join(branches)})"

        if "oneOf" in node:
            branches = [self._process_node(sub, f"{rule_hint}_one_{i}") for i, sub in enumerate(node["oneOf"])]
            return f"({' | '.join(branches)})"

        # Default fallback for arbitrary object/value
        return '"{" ws (string ws ":" ws (string | number | boolean | null))? (ws "," ws string ws ":" ws (string | number | boolean | null))* ws "}"'

    def _build_object_grammar(self, node: Dict[str, Any], rule_hint: str) -> str:
        properties: Dict[str, Any] = node.get("properties", {})
        required: Set[str] = set(node.get("required", []))

        if not properties:
            return '"{" ws "}"'

        prop_elements: List[str] = []
        for prop_name, prop_schema in properties.items():
            prop_rule_name = self._sanitize_rule_name(f"{rule_hint}_{prop_name}")
            prop_expr = self._process_node(prop_schema, prop_rule_name)
            self.rules[prop_rule_name] = prop_expr

            escaped_key = json.dumps(prop_name)
            pair = f'{json.dumps(escaped_key)} ws ":" ws {prop_rule_name}'

            if prop_name in required:
                prop_elements.append(pair)
            else:
                prop_elements.append(f"({pair})?")

        # Join ordered property sequence for structured JSON output
        parts: List[str] = ['"{" ws']
        for idx, elem in enumerate(prop_elements):
            if idx > 0:
                parts.append('ws ("," ws)?')
            parts.append(elem)
        parts.append('ws "}"')
        return " ".join(parts)

    def _sanitize_rule_name(self, name: str) -> str:
        clean = re.sub(r"[^a-zA-Z0-9_-]", "_", name)
        if not clean or clean[0].isdigit():
            clean = f"rule_{clean}"
        return clean.lower()


def generate_gbnf_from_model(model: Type[BaseModel], root_rule_name: str = "root") -> str:
    """Generates GBNF grammar from a Pydantic model class."""
    generator = GBNFGenerator()
    return generator.generate_from_model(model, root_rule_name=root_rule_name)


def generate_gbnf_from_schema(schema: Dict[str, Any], root_rule_name: str = "root") -> str:
    """Generates GBNF grammar from a JSON schema dictionary."""
    generator = GBNFGenerator()
    return generator.generate_from_schema(schema, root_rule_name=root_rule_name)


def generate_tool_call_gbnf(
    tools: Sequence[Union[Type[BaseModel], Dict[str, Any], ELOToolDefinition]],
) -> str:
    """Generates GBNF grammar for a union of tool definitions."""
    generator = GBNFGenerator()
    return generator.generate_tool_call_grammar(tools)


def parse_structured_json(text: str) -> Dict[str, Any]:
    """
    Robustly extracts and parses JSON dictionary from LLM completion text,
    stripping markdown fences, trailing comments, and preamble text.
    """
    cleaned = text.strip()

    # Match JSON markdown code fence
    fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned, re.IGNORECASE)
    if fence_match:
        candidate = fence_match.group(1).strip()
        try:
            res = json.loads(candidate)
            if isinstance(res, dict):
                return res
        except json.JSONDecodeError:
            pass

    # Direct JSON parse attempt
    try:
        res = json.loads(cleaned)
        if isinstance(res, dict):
            return res
    except json.JSONDecodeError:
        pass

    # Find outermost JSON braces
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = cleaned[start : end + 1]
        try:
            res = json.loads(candidate)
            if isinstance(res, dict):
                return res
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not parse valid JSON object from LLM response: {text[:200]}")


def parse_structured_output(text: str, target_model: Type[T]) -> T:
    """Parses LLM output directly into an instance of a Pydantic model."""
    data = parse_structured_json(text)
    return target_model.model_validate(data)


def parse_and_validate_tool_call(
    raw_output: str,
    tools: Optional[Sequence[Union[Type[BaseModel], Dict[str, Any], ELOToolDefinition]]] = None,
    call_id: Optional[str] = None,
) -> ToolCall:
    """
    Parses and validates a structured tool call from LLM response against available tool schemas.
    """
    data = parse_structured_json(raw_output)

    tool_name = data.get("name") or data.get("tool") or data.get("function")
    if not tool_name:
        raise ValueError("Missing 'name' field in structured tool call payload.")

    raw_args = data.get("arguments") or data.get("parameters") or {}
    if isinstance(raw_args, str):
        try:
            arguments = json.loads(raw_args)
        except json.JSONDecodeError:
            arguments = {}
    elif isinstance(raw_args, dict):
        arguments = raw_args
    else:
        arguments = {}

    # If tools definitions are provided, validate arguments against the target tool schema
    if tools:
        matched = False
        for tool in tools:
            target_name: str
            schema_or_model: Union[Dict[str, Any], Type[BaseModel]]

            if isinstance(tool, ELOToolDefinition):
                target_name = tool.name
                schema_or_model = tool.parameters_schema
            elif isinstance(tool, type) and issubclass(tool, BaseModel):
                target_name = tool.__name__
                schema_or_model = tool
            elif isinstance(tool, dict):
                target_name = tool.get("name", "")
                schema_or_model = tool.get("parameters_schema") or tool.get("parameters", {})
            else:
                continue

            if target_name == tool_name:
                arguments = validate_tool_arguments(tool_name, arguments, schema_or_model)
                matched = True
                break

        if not matched:
            raise ValueError(f"Tool '{tool_name}' is not in the set of authorized tools.")

    generated_id = call_id or f"call_{abs(hash((tool_name, json.dumps(arguments, sort_keys=True))))}"
    return ToolCall(
        id=generated_id,
        name=tool_name,
        arguments=arguments,
    )


def validate_tool_arguments(
    tool_name: str,
    arguments: Dict[str, Any],
    schema_or_model: Union[Type[BaseModel], Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Validates arguments against a Pydantic model or a JSON Schema dictionary.
    """
    if isinstance(schema_or_model, type) and issubclass(schema_or_model, BaseModel):
        try:
            validated_obj = schema_or_model.model_validate(arguments)
            return validated_obj.model_dump()
        except ValidationError as e:
            raise ValueError(f"Argument validation failed for tool '{tool_name}': {e}") from e

    if isinstance(schema_or_model, dict):
        properties = schema_or_model.get("properties", {})
        required = schema_or_model.get("required", [])

        # Check required fields
        for req in required:
            if req not in arguments:
                raise ValueError(f"Missing required parameter '{req}' for tool '{tool_name}'")

        # Type checks for basic primitive types
        for k, v in arguments.items():
            if k in properties:
                expected_type = properties[k].get("type")
                if expected_type == "integer" and not (isinstance(v, int) and not isinstance(v, bool)):
                    raise ValueError(f"Parameter '{k}' must be an integer, got {type(v).__name__}")
                elif expected_type == "number" and not (isinstance(v, (int, float)) and not isinstance(v, bool)):
                    raise ValueError(f"Parameter '{k}' must be a number, got {type(v).__name__}")
                elif expected_type == "boolean" and not isinstance(v, bool):
                    raise ValueError(f"Parameter '{k}' must be a boolean, got {type(v).__name__}")
                elif expected_type == "string" and not isinstance(v, str):
                    raise ValueError(f"Parameter '{k}' must be a string, got {type(v).__name__}")
                elif expected_type == "array" and not isinstance(v, list):
                    raise ValueError(f"Parameter '{k}' must be a list, got {type(v).__name__}")
                elif expected_type == "object" and not isinstance(v, dict):
                    raise ValueError(f"Parameter '{k}' must be a dict, got {type(v).__name__}")

    return arguments
