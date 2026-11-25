rm -rf .git
git init
git add .
git commit -m "Update"
git remote add origin https://github.com/amrhmorsy/amrhmorsy.github.io
git branch -m "main"
git push origin main --force
