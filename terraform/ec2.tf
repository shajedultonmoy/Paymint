resource "aws_iam_role" "backend" {
  name = "${var.project_name}-backend-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_instance_profile" "backend" {
  name = "${var.project_name}-backend-profile"
  role = aws_iam_role.backend.name
}

resource "aws_instance" "backend" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.public[0].id
  vpc_security_group_ids      = [aws_security_group.backend.id]
  key_name                    = var.key_name
  iam_instance_profile        = aws_iam_instance_profile.backend.name
  associate_public_ip_address = true

  user_data = templatefile("${path.module}/user-data/backend.sh", {
    db_host     = aws_db_instance.mysql.address
    db_name     = var.db_name
    db_username = var.db_username
  })

  tags = {
    Name = "${var.project_name}-backend"
  }
}
