# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
$memory = "1024"

Vagrant.configure("2") do |config|
  config.vm.box = "boxcutter/ubuntu1604"

  config.vm.provider "virtualbox" do |vb|
    vb.memory = $memory 
  end

  config.vm.provider "parallels" do |p, o|
    p.memory = $memory
  end

  config.vm.synced_folder ".", "/src/consul-gateway"

  config.vm.provision "shell", inline: <<-SHELL
    apt-get update
    apt-get install curl unzip make g++ -y

    echo Downlaoding consul...
    cd /tmp
    curl -sSL https://releases.hashicorp.com/consul/0.6.4/consul_0.6.4_linux_amd64.zip -o consul.zip

    echo Installing consul...
    unzip consul.zip 
    mv consul /usr/bin/consul 

    echo Installing node...
    curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    npm install -g npm 
    npm install -g mocha

    cd /src/consul-gateway

    consul agent -dev >> /var/log/consul.log &
  SHELL
end
