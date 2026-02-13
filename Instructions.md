# Steps taken

-updated my pnpm to the latest version
pnpm up (updates pnpm)

-Installation of firebase dependencies

pnpm add -D firebase-tools -w (It adds the CLI to your monorepo's devDependencies. This ensures that every developer (and your CI/CD pipeline) is using the exact same version of the Firebase CLI.)

create a file named firebase.ts

## Starts the Vite dev server for the web app in background; I'll watch the output

pnpm --filter web dev
