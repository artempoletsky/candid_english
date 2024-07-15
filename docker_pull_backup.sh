
docker pull artempoletsky/backup

docker compose -f "compose.yaml" stop

docker run --rm -v drill_database:/backup-volume artempoletsky/drillbackup tar -xf /backup/db.tar.gz -C /backup-volume
docker run --rm -v drill_public:/backup-volume artempoletsky/drillbackup tar -xf /backup/public.tar.gz -C /backup-volume
docker run --rm -v drill_static:/backup-volume artempoletsky/drillbackup tar -xf /backup/static.tar.gz -C /backup-volume

docker compose -f "compose.yaml" up -d

