# Clean Player v0.1.0

Clean Player is a small LAMPA-like media catalog shell for Android phones, Android TV, and LG webOS TV. It ships with no remote default servers, no ad SDKs, no analytics SDKs, and no bundled plugin loader.

## Builds

- Android APK: `./scripts/build_android.sh`
- LG webOS TV IPK: `./scripts/build_webos.sh`
- Network audit: `./scripts/audit_network.sh`

The Android APK contains a native WebView guard. Remote origins are blocked until the app UI explicitly registers a user-provided source URL, poster URL, or media URL. The webOS app uses the same local web client and stores network activity in the in-app log.

## Catalog JSON

```json
{
  "name": "My catalog",
  "items": [
    {
      "id": "movie-1",
      "title": "Movie title",
      "year": 2026,
      "type": "movie",
      "genres": ["Drama"],
      "poster": "https://example.com/poster.jpg",
      "description": "Description",
      "video": "https://example.com/video.m3u8"
    }
  ]
}
```

Remote requests only happen after adding/loading a source or opening a direct media URL.
