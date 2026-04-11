import subprocess
import time


class Notifier:
    """Handles system notifications with cooldown."""
    
    def __init__(self, cooldown_seconds=120):
        """
        Initialize notifier with cooldown.
        
        Args:
            cooldown_seconds: Minimum seconds between notifications (default: 120 = 2 minutes)
        """
        self.cooldown_seconds = cooldown_seconds
        self._last_notify_ts = 0
    
    def notify_drift(self, goal, confidence):
        """Send drift notification if cooldown has passed."""
        now = time.time()
        time_since_last = now - self._last_notify_ts
        
        if time_since_last < self.cooldown_seconds:
            remaining = int(self.cooldown_seconds - time_since_last)
            print(f"🔕 Notification cooldown: {remaining}s remaining")
            return
        
        message = f"You may be drifting from your goal:\n{goal}"
        message = message.replace('\\', '\\\\').replace('"', '\\"')
        
        import platform
        if platform.system() == "Windows":
            ps_script = (
                f'[reflection.assembly]::loadwithpartialname("System.Windows.Forms"); '
                f'$notify = new-object system.windows.forms.notifyicon; '
                f'$notify.icon = [System.Drawing.SystemIcons]::Information; '
                f'$notify.visible = $true; '
                f'$notify.showballoontip(10,"⚠️ Drift Alert","{message}",[system.windows.forms.tooltipicon]::Warning)'
            )
            try:
                subprocess.run(["powershell", "-Command", ps_script], timeout=5, creationflags=subprocess.CREATE_NO_WINDOW)
                print(f"🔔 Notification sent! (Confidence: {confidence:.2f})")
                self._last_notify_ts = now
            except Exception as e:
                print(f"⚠️ Notification error: {e}")
        else:
            # macOS
            script = f'display notification "{message}" with title "⚠️ Drift Alert" sound name "default"'
            try:
                subprocess.run(["osascript", "-e", script], timeout=5)
                print(f"🔔 Notification sent! (Confidence: {confidence:.2f})")
                self._last_notify_ts = now
            except Exception as e:
                print(f"⚠️ Notification error: {e}")
