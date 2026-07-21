variable "aws_region"    { default = "ap-south-1" }
variable "environment"   { default = "production" }
variable "db_password"   { sensitive = true }
variable "jwt_secret"    { sensitive = true }
variable "domain_name"   { default = "hera-platform.com" }
