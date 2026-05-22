output "backend_public_ip" {
  description = "Public IP address of the backend EC2 instance."
  value       = aws_instance.backend.public_ip
}

output "backend_public_dns" {
  description = "Public DNS name of the backend EC2 instance."
  value       = aws_instance.backend.public_dns
}

output "rds_endpoint" {
  description = "Private RDS MySQL endpoint."
  value       = aws_db_instance.mysql.address
}

output "vpc_id" {
  description = "Paymint VPC ID."
  value       = aws_vpc.main.id
}
