# Localization Guidelines

## Tone

- **English (en):** Friendly, clear, and professional.
- **Thai (th):** Warm, polite, and easy to understand.
- **Chinese (zh):** Concise and neutral; avoid overly casual expressions.

## Pluralization

Use a `{count}` placeholder for messages that need pluralization. Example:

```json
{
  "item": "{{count}} item",
  "item_plural": "{{count}} items"
}
```

Ensure all locales use matching keys with `{count}` for plural forms.
