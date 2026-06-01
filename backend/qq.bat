npx prisma generate
npx prisma db push --force-reset
rmdir /s /q dist
npx tsc -p tsconfig.build.json