terraform {
  required_providers {
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }
}

# 1. Define Variables for easy configuration
variable "server_ip" {
  type    = string
  default = "172.16.10.220"
}

variable "ssh_user" {
  type    = string
  default = "ubuntu"  # <-- CHANGE THIS to your server username
}

variable "ssh_private_key_path" {
  type    = string
  default = "~/.ssh/id_rsa" # <-- CHANGE THIS to your local private SSH key path
}

# 2. Define the execution logic on your server
resource "null_resource" "deploy_paymint_app" {
  
  # The timestamp forces Terraform to execute the script every time you run "terraform apply"
  triggers = {
    always_run = "${timestamp()}"
  }

  # Establish the secure connection to your Ubuntu machine
  connection {
    type        = "ssh"
    user        = var.ssh_user
    private_key = file(var.ssh_private_key_path)
    host        = var.server_ip
  }

  # Task A: Ensure the code is fetched/updated on the remote machine
  provisioner "remote-exec" {
    inline = [
      "echo '=== [1/2] Fetching application source code ==='",
      "if [ ! -d 'Paymint' ]; then git clone https://github.com/shajedultonmoy/Paymint.git; else cd Paymint && git pull origin main; fi"
    ]
  }

  # Task B: Launch your application
  # NOTE: Swap out the commands below depending on how Paymint runs (Docker, Node, Python, etc.)
  provisioner "remote-exec" {
    inline = [
      "echo '=== [2/2] Starting application build and run ==='",
      "cd Paymint",
      
      # Example 1: If your repo uses Docker Compose (Recommended)
      "docker-compose up -d --build"
      
      # Example 2: If it's a Node.js App without Docker (Uncomment if needed)
      # "npm install",
      # "pm2 restart paymint || pm2 start server.js --name paymint"
    ]
  }
}
