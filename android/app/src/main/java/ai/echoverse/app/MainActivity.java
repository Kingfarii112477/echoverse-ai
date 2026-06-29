package ai.echoverse.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(com.getcapacitor.plugin.SplashScreen.class);
        super.onCreate(savedInstanceState);
    }
}
