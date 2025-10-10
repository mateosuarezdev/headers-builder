//@ts-nocheck

console.log("🚀 Starting build process...");

Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  external: ["zod"],
  target: "bun",
  minify: true,
  sourcemap: "external",
})
  .then((val) => {
    // Check for errors or warnings
    if (val.success) {
      console.log("✅ Build completed successfully!");
      console.log(`Output files: ${val.outputs.length}`);
    } else {
      console.error("❌ Build failed!");
      // Log detailed errors/warnings from the build
      val.logs.forEach((log) => console.error(log.message));
    }

    // You can also log the entire logs array if you want to see everything
    // console.log(val.logs);
  })
  .catch((error) => {
    // This catches errors related to the script or Bun.build function itself
    console.error("An unexpected error occurred:", error);
  });

// This will log immediately after Bun.build is called (before it finishes)
console.log("⏳ Waiting for build to complete...");
