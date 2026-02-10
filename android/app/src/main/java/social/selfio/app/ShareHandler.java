package social.selfio.app;

import android.content.Intent;
import android.net.Uri;

import androidx.core.content.FileProvider;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;

import java.io.File;

@CapacitorPlugin(name = "ShareHandler")
public class ShareHandler extends Plugin {

    @PluginMethod()
    public void canShare(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("value", true);
        call.resolve(ret);
    }

    @PluginMethod()
    public void share(PluginCall call) {
        String title = call.getString("title", "");
        String url = call.getString("url", "");

        if (url == null || url.isEmpty()) {
            call.reject("URL is required");
            return;
        }

        getActivity().runOnUiThread(() -> {
            try {
                Intent shareIntent = new Intent(Intent.ACTION_SEND);
                shareIntent.setType("image/*");

                // Try to resolve as a file URI
                Uri fileUri = null;
                if (url.startsWith("file://")) {
                    File file = new File(Uri.parse(url).getPath());
                    if (file.exists()) {
                        fileUri = FileProvider.getUriForFile(
                            getContext(),
                            getContext().getPackageName() + ".fileprovider",
                            file
                        );
                    }
                } else if (url.startsWith("content://")) {
                    fileUri = Uri.parse(url);
                } else if (url.startsWith("/")) {
                    // Absolute path
                    File file = new File(url);
                    if (file.exists()) {
                        fileUri = FileProvider.getUriForFile(
                            getContext(),
                            getContext().getPackageName() + ".fileprovider",
                            file
                        );
                    }
                }

                if (fileUri != null) {
                    shareIntent.putExtra(Intent.EXTRA_STREAM, fileUri);
                    shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                } else {
                    // Fallback: share as text URL
                    shareIntent.setType("text/plain");
                    shareIntent.putExtra(Intent.EXTRA_TEXT, url);
                }

                if (title != null && !title.isEmpty()) {
                    shareIntent.putExtra(Intent.EXTRA_SUBJECT, title);
                }

                getActivity().startActivity(Intent.createChooser(shareIntent, title));
                call.resolve();
            } catch (Exception e) {
                call.reject("Share failed: " + e.getMessage(), e);
            }
        });
    }
}