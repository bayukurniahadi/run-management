#!/bin/sh
set -e
echo "[entrypoint] menunggu Postgres siap"
node -e "
const p=require('postgres');const url=process.env.DATABASE_URL;
(async()=>{for(let i=0;i<40;i++){try{const s=p(url,{max:1,connect_timeout:2});await s\`select 1\`;await s.end();console.log('[entrypoint] db siap');process.exit(0)}catch(e){await new Promise(r=>setTimeout(r,1500))}}console.error('[entrypoint] db tidak menyahut');process.exit(1)})();
"

if [ "$RUN_MIGRATIONS_ON_START" = "1" ]; then
  echo "[entrypoint] migrate"
  node ./scripts/migrate.mjs
  echo "[entrypoint] seed"
  node ./scripts/seed.mjs || echo "[entrypoint] seed dilewati"
fi

exec node server.js
