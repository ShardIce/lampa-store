package com.shardice.cleanplayer;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

public class MainActivity extends Activity {
    private static final String START_URL = "file:///android_asset/index.html";

    private WebView webView;
    private NetworkBridge networkBridge;

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        networkBridge = new NetworkBridge();
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(16, 19, 18));
        webView.setWebViewClient(new GuardedClient(networkBridge));
        webView.addJavascriptInterface(networkBridge, "CleanBridge");

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setUserAgentString("CleanPlayer/0.1.0 AndroidWebView");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
        }
        CookieManager.getInstance().setAcceptCookie(false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(false);
        }

        webView.clearCache(true);
        webView.clearHistory();
        setContentView(webView);
        webView.loadUrl(START_URL);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
    }

    @Override
    protected void onPause() {
        if (webView != null) webView.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.removeJavascriptInterface("CleanBridge");
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        if (webView == null) {
            super.onBackPressed();
            return;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            webView.evaluateJavascript(
                    "window.CleanPlayer&&CleanPlayer.back?CleanPlayer.back():false",
                    value -> {
                        if (!"true".equals(value)) {
                            if (webView != null && webView.canGoBack()) webView.goBack();
                            else MainActivity.super.onBackPressed();
                        }
                    }
            );
        } else if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    private static final class GuardedClient extends WebViewClient {
        private final NetworkBridge bridge;

        GuardedClient(NetworkBridge bridge) {
            this.bridge = bridge;
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            return inspect(request.getUrl());
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
            return inspect(Uri.parse(url));
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            if (bridge.isRemote(uri)) bridge.allowOrigin(uri);
            return false;
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            Uri uri = Uri.parse(url);
            if (bridge.isRemote(uri)) bridge.allowOrigin(uri);
            return false;
        }

        private WebResourceResponse inspect(Uri uri) {
            if (uri == null || !bridge.isRemote(uri)) return null;
            String url = uri.toString();
            if (bridge.isAllowed(uri)) {
                bridge.record("native", url, "allowed", false);
                return null;
            }
            bridge.record("native", url, "blocked", true);
            byte[] body = "Blocked by Clean Player network guard".getBytes(StandardCharsets.UTF_8);
            Map<String, String> headers = new HashMap<>();
            headers.put("Access-Control-Allow-Origin", "*");
            headers.put("Cache-Control", "no-store");
            return new WebResourceResponse(
                    "text/plain",
                    "utf-8",
                    403,
                    "Blocked",
                    headers,
                    new ByteArrayInputStream(body)
            );
        }
    }

    public static final class NetworkBridge {
        private final Set<String> allowedOrigins = Collections.synchronizedSet(new HashSet<String>());
        private final List<JSONObject> pendingEvents = Collections.synchronizedList(new ArrayList<JSONObject>());

        @JavascriptInterface
        public void allowUrl(String rawUrl) {
            Uri uri = Uri.parse(rawUrl);
            if (!isRemote(uri)) return;
            allowOrigin(uri);
        }

        @JavascriptInterface
        public String consumeNativeLogJson() {
            JSONArray array = new JSONArray();
            synchronized (pendingEvents) {
                for (JSONObject event : pendingEvents) array.put(event);
                pendingEvents.clear();
            }
            return array.toString();
        }

        boolean isRemote(Uri uri) {
            if (uri == null || uri.getScheme() == null) return false;
            String scheme = uri.getScheme().toLowerCase(Locale.US);
            return "http".equals(scheme) || "https".equals(scheme);
        }

        void allowOrigin(Uri uri) {
            String origin = originOf(uri);
            if (!origin.isEmpty()) {
                allowedOrigins.add(origin);
                record("native-allow", origin, "allowed", false);
            }
        }

        boolean isAllowed(Uri uri) {
            String origin = originOf(uri);
            return origin.isEmpty() || allowedOrigins.contains(origin);
        }

        void record(String kind, String url, String status, boolean blocked) {
            try {
                JSONObject event = new JSONObject();
                event.put("kind", kind);
                event.put("url", url);
                event.put("status", status);
                event.put("blocked", blocked);
                synchronized (pendingEvents) {
                    pendingEvents.add(event);
                    while (pendingEvents.size() > 60) pendingEvents.remove(0);
                }
            } catch (Exception ignored) {
            }
        }

        private String originOf(Uri uri) {
            if (!isRemote(uri) || uri.getHost() == null) return "";
            String scheme = uri.getScheme().toLowerCase(Locale.US);
            String host = uri.getHost().toLowerCase(Locale.US);
            int port = uri.getPort();
            boolean defaultPort = ("http".equals(scheme) && port == 80) || ("https".equals(scheme) && port == 443);
            return port > -1 && !defaultPort ? scheme + "://" + host + ":" + port : scheme + "://" + host;
        }
    }
}
