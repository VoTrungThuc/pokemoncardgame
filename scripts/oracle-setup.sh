#!/usr/bin/env bash
# One-time setup for a fresh Oracle Cloud Ubuntu instance.
set -eu

USER=$(whoami)
echo "==> Running setup for user: $USER"

sudo apt update
sudo DEBIAN_FRONTEND=noninteractive apt upgrade -y

sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo DEBIAN_FRONTEND=noninteractive apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

sudo usermod -aG docker "$USER"
echo "NOTE: use 'sudo docker' until you start a fresh login shell."

sudo DEBIAN_FRONTEND=noninteractive apt install -y nginx certbot python3-certbot-nginx

mkdir -p ~/pokemon
sudo mkdir -p /var/www/pokemon
sudo chown -R "$USER:$USER" /var/www/pokemon

if command -v ufw >/dev/null 2>&1; then
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw --force enable || true
fi

echo "==> Done. Next steps:"
echo "    1. In OCI Console, open ports 22/80/443 in the VCN Security List."
echo "    2. Copy deploy/nginx.conf -> /etc/nginx/sites-available/pokemon"
echo "       set your domain, then: sudo ln -sf /etc/nginx/sites-available/pokemon /etc/nginx/sites-enabled/pokemon && sudo nginx -t && sudo systemctl reload nginx"
echo "    3. Issue SSL: sudo certbot --nginx -d yourdomain.com"
echo "    4. Push to main -> GitHub Actions deploys the backend."
