<!-- markdownlint-disable -->
<h1 align="center">
	<img src="https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/misc/transparent.png" height="30" width="0px"/>
	Honcho Dashboard</br>
</h1>

<p align="center">
  An unofficial dashboard for <a href="https://github.com/plastic-labs/honcho">Honcho by Plastic Labs</a>.</br>
  <img src="https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/misc/transparent.png" height="30" width="0px"/>
  <img src="./.github/assets/preview.webp" alt="Honcho Dashboard Preview"/>
</p>
<!-- markdownlint-enable -->

> [!NOTE]
>
> This is a third-party dashboard for Honcho, not the official `app.honcho.dev`
> UI.

## Quick start

Run the dashboard with Docker:

```bash
docker run -e HONCHO_BASE_URL=http://localhost:8000 -p 3000:3000 ghcr.io/tolkonepiu/honcho-dashboard:latest
```

Available environment variables:

- `HONCHO_BASE_URL` — required, the base URL of your Honcho instance
- `HONCHO_API_KEY` — optional, required only if your Honcho instance is
  protected by an API key

If your instance requires authentication:

```bash
docker run -e HONCHO_BASE_URL=http://localhost:8000 -e HONCHO_API_KEY=your-api-key -p 3000:3000 ghcr.io/tolkonepiu/honcho-dashboard:latest
```

Then open [http://localhost:3000](http://localhost:3000).

## Related links

- [Honcho repository](https://github.com/plastic-labs/honcho)
- [Honcho documentation](https://docs.honcho.dev)
