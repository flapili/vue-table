import { defineConfig, presetIcons, presetUno, transformerVariantGroup } from 'unocss'

export default defineConfig({
  presets: [
    presetIcons({
      extraProperties: {
        display: 'inline-block',
      },
    }),
    presetUno(),
  ],
  transformers: [
    transformerVariantGroup(),
  ],
})
