package social.selfio.app

import android.app.Application
import io.appmetrica.analytics.AppMetrica
import io.appmetrica.analytics.AppMetricaConfig

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        val config = AppMetricaConfig.newConfigBuilder(BuildConfig.APP_METRICA_API_KEY).build()
        AppMetrica.activate(this, config)
        AppMetrica.enableActivityAutoTracking(this)
    }
}