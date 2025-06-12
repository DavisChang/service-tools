#!/bin/bash

# === Configuration ===
DOMAIN="chatgpt.com"
DNS_SERVER="8.8.8.8"
FULL_URL="https://$DOMAIN"

# === Step 1: DNS Lookup ===
echo "🔍 [Step 1] DNS Lookup using public DNS ($DNS_SERVER)"
dig +short $DOMAIN @$DNS_SERVER

if [[ $? -ne 0 || -z $(dig +short $DOMAIN @$DNS_SERVER) ]]; then
  echo "❌ DNS lookup failed or domain does not exist (NXDOMAIN)."
  echo "➡️  Check if the domain name is correct and properly registered in DNS (e.g., Route 53)."
  exit 1
else
  IP=$(dig +short $DOMAIN @$DNS_SERVER | head -n1)
  echo "✅ Domain resolves to: $IP"
fi

# === Step 2: HTTPS Connectivity Test ===
echo -e "\n🌐 [Step 2] HTTPS Connectivity Test (headers only)"
curl -I --connect-timeout 5 $FULL_URL

if [[ $? -ne 0 ]]; then
  echo "❌ Could not establish connection to $FULL_URL"
  echo "➡️  Check network, firewall rules, or if the service is running."
else
  echo "✅ Connection successful. Server responded with headers."
fi

# === Step 3: TLS Certificate Inspection ===
echo -e "\n🔐 [Step 3] TLS Certificate Inspection"
echo | openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" 2>/dev/null | openssl x509 -noout -subject -issuer -dates

if [[ $? -ne 0 ]]; then
  echo "❌ SSL certificate check failed."
  echo "➡️  Verify server is serving HTTPS correctly and using a valid certificate."
else
  echo "✅ SSL certificate is present and readable."
fi

# === Step 4: Traceroute ===
echo -e "\n📡 [Step 4] Traceroute to Identify Routing Issues"
traceroute $DOMAIN || traceroute6 $DOMAIN