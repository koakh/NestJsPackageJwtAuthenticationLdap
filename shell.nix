{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  packages = with pkgs; [ 
    nest-cli
    nodejs
    # nodePackages.pnpm
    nodePackages_latest.pnpm
  ];
}