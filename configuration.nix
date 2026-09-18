{ config, pkgs, lib, ... }:

{
  imports = [
    ./hardware-configuration.nix
  ];

  boot.loader.systemd-boot = {
    enable = true;
    efiSupport = true;
    configurationLimit = 20;
  };
  boot.loader.efi.canTouchEfiVariables = true;
  boot.kernelPackages = pkgs.linuxPackages_latest;
  boot.kernel.sysctl = {
    "vm.swappiness" = 10;
    "net.core.default_qdisc" = "fq";
    "net.ipv4.tcp_congestion_control" = "bbr";
  };

  networking = {
    hostName = "homelab-max";
    domain = "homelab.internal";
    networkmanager.enable = true;
    firewall = {
      enable = true;
      allowPing = true;
      allowedTCPPorts = [ 22 80 443 8080 ];
      allowedUDPPorts = [ 51820 ];
    };
    useDHCP = lib.mkDefault true;
  };

  time.timeZone = "Europe/Bucharest";
  i18n.defaultLocale = "en_US.UTF-8";

  security.sudo.execWheelOnly = true;
  services.fail2ban.enable = true;

  users.users.admin = {
    isNormalUser = true;
    uid = 1000;
    extraGroups = [ "wheel" "docker" "networkmanager" "podman" ];
    shell = pkgs.zsh;
    initialHashedPassword = "$6$rounds=65536$exh...placeholder...$hash";
  };

  programs.zsh = {
    enable = true;
    enableCompletion = true;
    autosuggestions.enable = true;
    syntaxHighlighting.enable = true;
  };

  environment.systemPackages = with pkgs; [
    git curl wget tmux neovim fastfetch btop ripgrep fd htop
    dnsutils nmap tcpdump sysstat pciutils usbutils jq yq
    ncdu rsync unzip zip git-crypt lvm2
  ];

  services.openssh = {
    enable = true;
    settings = {
      PermitRootLogin = "prohibit-password";
      PasswordAuthentication = false;
      X11Forwarding = false;
      KexAlgorithms = [ "curve25519-sha256" "curve25519-sha256@libssh.org" ];
    };
  };

  virtualisation = {
    docker = {
      enable = true;
      autoPrune.enable = true;
      enableOnBoot = true;
    };
    podman = {
      enable = true;
      dockerCompat = true;
      defaultNetwork.settings.dns_enabled = true;
    };
  };

  services.resolved = {
    enable = true;
    dnssec = "true";
    domains = [ "~." ];
    fallbackDns = [ "1.1.1.1" "8.8.8.8" ];
  };

  services.journald.extraConfig = ''
    SystemMaxUse=500M
    MaxFileSec=1week
  '';

  system.autoUpgrade = {
    enable = true;
    dates = "04:00";
    randomizedDelaySec = "45min";
  };

  system.stateVersion = "26.05";
}
