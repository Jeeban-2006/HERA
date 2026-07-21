# VPC
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.1"
  name    = "hera-vpc-${var.environment}"
  cidr    = "10.0.0.0/16"
  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  enable_nat_gateway = true
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier        = "hera-postgres-${var.environment}"
  engine            = "postgres"
  engine_version    = "15.4"
  instance_class    = "db.t3.medium"
  allocated_storage = 20
  db_name           = "hera_db"
  username          = "hera"
  password          = var.db_password
  multi_az          = true
  skip_final_snapshot = false
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  tags = { Name = "hera-rds" }
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "redis" {
  cluster_id      = "hera-redis"
  engine          = "redis"
  node_type       = "cache.t3.micro"
  num_cache_nodes = 1
  port            = 6379
  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "hera-cluster-${var.environment}"
}

# S3 — uploads
resource "aws_s3_bucket" "uploads" {
  bucket = "hera-uploads-${var.environment}"
}
resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket                  = aws_s3_bucket.uploads.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
