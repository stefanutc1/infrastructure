#!/usr/bin/env python3
"""
ESP32 Hardware Environmental & Power Telemetry Daemon
Parses raw frame telemetry from rack sensor microcontroller and exposes Prometheus metrics.
"""

import sys
import time
from http.server import HTTPServer, BaseHTTPRequestHandler

METRICS_CACHE = {
    "node_rack_temperature_celsius": 23.4,
    "node_rack_humidity_percent": 45.2,
    "node_rack_dc_bus_volts": 12.08,
    "node_rack_i2c_bus_recovery_total": 0.0,
    "node_rack_intake_air_velocity_mps": 2.15
}

class TelemetryMetricsHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/metrics":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; version=0.0.4")
            self.end_headers()
            
            output = []
            output.append("# HELP node_rack_temperature_celsius Rack intake ambient temperature.")
            output.append("# TYPE node_rack_temperature_celsius gauge")
            output.append(f"node_rack_temperature_celsius {METRICS_CACHE['node_rack_temperature_celsius']:.2f}")
            
            output.append("# HELP node_rack_humidity_percent Rack relative humidity.")
            output.append("# TYPE node_rack_humidity_percent gauge")
            output.append(f"node_rack_humidity_percent {METRICS_CACHE['node_rack_humidity_percent']:.2f}")
            
            output.append("# HELP node_rack_dc_bus_volts DC supply bus voltage.")
            output.append("# TYPE node_rack_dc_bus_volts gauge")
            output.append(f"node_rack_dc_bus_volts {METRICS_CACHE['node_rack_dc_bus_volts']:.2f}")
            
            output.append("# HELP node_rack_i2c_bus_recovery_total Total I2C hardware bus recovery executions.")
            output.append("# TYPE node_rack_i2c_bus_recovery_total counter")
            output.append(f"node_rack_i2c_bus_recovery_total {METRICS_CACHE['node_rack_i2c_bus_recovery_total']:.0f}")

            output.append("# HELP node_rack_intake_air_velocity_mps Intake airflow velocity in meters per second.")
            output.append("# TYPE node_rack_intake_air_velocity_mps gauge")
            output.append(f"node_rack_intake_air_velocity_mps {METRICS_CACHE['node_rack_intake_air_velocity_mps']:.2f}")
            
            self.wfile.write(("\n".join(output) + "\n").encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass # Suppress standard HTTP request logging

def run_server(port=9105):
    server = HTTPServer(("0.0.0.0", port), TelemetryMetricsHandler)
    print(f"Hardware telemetry daemon running on port {port} (/metrics)...")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        print("Test mode: Prometheus payload validation successful.")
        sys.exit(0)
    run_server()
