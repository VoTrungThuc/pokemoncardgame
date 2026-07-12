#!/usr/bin/env bash
set -eu

cd ~
if [ -d pokemon/.git ]; then
  cd pokemon && git pull --ff-only
else
  git clone https://github.com/TranHoangTrungHieu/PRM-project.git pokemon
  cd pokemon
fi

# Generate .env only on first run (keep DB password stable on redeploys)
if [ ! -f .env ]; then
  DB_PASSWORD=$(openssl rand -base64 18 | tr -d '/+=')
  cat > .env <<ENV
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=c29tZS12ZXJ5LXNlY3VyZS1hbmQtbG9uZy1zZWNyZXQta2V5LXdoaWNoLW11c3QtYmUtYXQtbGVhc3QtMjU2LWJpdHMtbG9uZw==
JWT_EXPIRATION=36000000
VNP_TMN_CODE=801QEZ0R
VNP_HASH_SECRET=YJ2GMIUGOHCOCA4PX7NB12S7OGA6UEZR
VNP_PAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://129.80.105.58/payment-result
MAIL_USERNAME=pokemoncardstore4@gmail.com
MAIL_PASSWORD=wjkgygajxwrplddd
ENV
  chmod 600 .env
  echo "==> Generated .env with DB_PASSWORD=$DB_PASSWORD"
fi

sudo docker compose -f docker-compose.prod.yml up -d --build
sudo docker compose -f docker-compose.prod.yml ps
