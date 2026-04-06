#!/bin/bash
# Script de push automatique vers GitHub
# Utilisation: bash push_github.sh "Message de commit"

set -e

MESSAGE="${1:-Mise à jour GagnezMobile}"
CLEAN_USER=$(echo "${GITHUB_USERNAME}" | tr -d ' \n\r')
CLEAN_TOKEN=$(echo "${GITHUB_TOKEN}" | tr -d ' \n\r')
REMOTE="https://${CLEAN_USER}:${CLEAN_TOKEN}@github.com/${CLEAN_USER}/gagnez-mobile.git"

echo "📤 Push vers GitHub en cours..."
git push "$REMOTE" main
echo "✅ Code envoyé sur https://github.com/${CLEAN_USER}/gagnez-mobile"
