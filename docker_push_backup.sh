
docker run --rm -v drill_database:/backup-volume -v ./backup:/backup busybox tar -zcvf /backup/db.tar.gz -C /backup-volume .
docker run --rm -v drill_public:/backup-volume -v ./backup:/backup busybox tar -zcvf /backup/public.tar.gz -C /backup-volume .
docker run --rm -v drill_static:/backup-volume -v ./backup:/backup busybox tar -zcvf /backup/static.tar.gz -C /backup-volume .

docker build . -f "Dockerfile.backup" --tag artempoletsky/drillbackup

docker push artempoletsky/drillbackup

rm -rf ./backup