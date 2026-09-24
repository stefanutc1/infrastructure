terraform {
  required_version = ">= 1.5.0"
  required_providers {
    hyperv = {
      source  = "windsorcli/hyperv"
      version = "~> 0.3"
    }
  }
}

provider "hyperv" {
  backend = "local" 
}
