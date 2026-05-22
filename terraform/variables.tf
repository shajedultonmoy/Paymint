variable "aws_region" {
  description = "AWS region for Paymint infrastructure."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name prefix for AWS resources."
  type        = string
  default     = "paymint"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.20.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDRs for public subnets."
  type        = list(string)
  default     = ["10.20.1.0/24", "10.20.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDRs for private subnets."
  type        = list(string)
  default     = ["10.20.11.0/24", "10.20.12.0/24"]
}

variable "ami_id" {
  description = "AMI ID for the backend EC2 instance."
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type for the backend."
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "Optional EC2 key pair name for SSH access."
  type        = string
  default     = null
}

variable "admin_cidr" {
  description = "CIDR allowed to SSH to EC2."
  type        = string
  default     = "0.0.0.0/0"
}

variable "db_name" {
  description = "RDS MySQL database name."
  type        = string
  default     = "paymint"
}

variable "db_username" {
  description = "RDS master username."
  type        = string
  default     = "paymint_admin"
}

variable "db_password" {
  description = "RDS master password."
  type        = string
  sensitive   = true
}
