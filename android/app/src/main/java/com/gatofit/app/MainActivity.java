package com.gatofit.app;

import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowInsetsController;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable edge-to-edge display for Android 15+
        enableEdgeToEdge();
    }

    private void enableEdgeToEdge() {
        Window window = getWindow();

        // Enable edge-to-edge for all Android versions
        WindowCompat.setDecorFitsSystemWindows(window, false);

        // For Android 11+ (API 30+), use WindowInsetsController
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsController controller = window.getInsetsController();
            if (controller != null) {
                // Allow system bars to be shown/hidden with swipe gestures
                controller.setSystemBarsBehavior(
                        WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        }
    }
}
