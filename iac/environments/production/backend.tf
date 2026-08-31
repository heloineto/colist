terraform {
  backend "s3" {
    bucket       = "colist-tfstate"
    key          = "colist/production/terraform.tfstate"
    region       = "us-east-2"
    encrypt      = true
    use_lockfile = true
  }
}
