{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  packages = with pkgs; [ 
    nest-cli
    nodejs
    nodePackages.typescript
    nodePackages.pnpm
    nodePackages.yalc
  ];
}
