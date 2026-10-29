# Third-party notices

This app bundles the following third-party components. Each remains under its own license.

| Component | Files | License | Source |
|---|---|---|---|
| ONNX Runtime Web 1.17.3 | `ort/` | MIT | https://github.com/microsoft/onnxruntime |
| U²-Net general cut-out model ("silueta" build distributed by rembg) | `model/silueta.part*.wasm` | Apache-2.0 (U²-Net); rembg is MIT | https://github.com/xuebinqin/U-2-Net · https://github.com/danielgatis/rembg |
| Clothing segmentation model (U²-Net trained on iMaterialist), compressed to 8-bit weights for this app | `model/cloth.part*.wasm` | MIT | https://github.com/levindabhi/cloth-segmentation |
| Bricolage Grotesque | `fonts/bricolage-grotesque-*` | SIL Open Font License 1.1 | https://fonts.google.com/specimen/Bricolage+Grotesque |
| Figtree | `fonts/figtree-*` | SIL Open Font License 1.1 | https://fonts.google.com/specimen/Figtree |
| IBM Plex Mono | `fonts/ibm-plex-mono-*` | SIL Open Font License 1.1 | https://github.com/IBM/plex |

The model files are split into parts under 15 MB with a `.wasm` file name so they can be uploaded through the GitHub website; the app joins them back together when it loads them.
