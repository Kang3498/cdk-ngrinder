export LANG=ko_KR.utf8
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -aG docker ssm-user
newgrp docker
docker run -d -v ~/ngrinder-controller/:/opt/ngrinder-controller --name controller -p 80:80 -p 16001:16001 -p 12000-12100:12000-12100 ngrinder/controller