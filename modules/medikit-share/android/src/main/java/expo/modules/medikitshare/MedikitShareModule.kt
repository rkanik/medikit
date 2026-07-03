package expo.modules.medikitshare

import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MedikitShareModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MedikitShare")

    AsyncFunction("shareFiles") { uris: List<String>, mimeType: String?, promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.reject("ERR_NO_CONTEXT", "React context is not available", null)
        return@AsyncFunction
      }

      val streamUris = ArrayList<Uri>()
      for (uriString in uris) {
        streamUris.add(Uri.parse(uriString))
      }

      if (streamUris.isEmpty()) {
        promise.reject("ERR_NO_FILES", "No files to share", null)
        return@AsyncFunction
      }

      val intent = Intent(Intent.ACTION_SEND_MULTIPLE).apply {
        type = mimeType ?: "*/*"
        putParcelableArrayListExtra(Intent.EXTRA_STREAM, streamUris)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      }

      val chooser = Intent.createChooser(intent, "Share")
      val resInfoList = context.packageManager.queryIntentActivities(
        chooser,
        PackageManager.MATCH_DEFAULT_ONLY
      )
      for (resolveInfo in resInfoList) {
        val packageName = resolveInfo.activityInfo.packageName
        for (uri in streamUris) {
          context.grantUriPermission(
            packageName,
            uri,
            Intent.FLAG_GRANT_READ_URI_PERMISSION
          )
        }
      }

      appContext.throwingActivity.startActivity(chooser)
      promise.resolve(null)
    }
  }
}
