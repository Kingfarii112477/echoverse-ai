# ProGuard rules for EchoVerse AI
-keep public class * {
    public protected *;
}
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
