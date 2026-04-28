import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { FoodItem } from '../models/types';
import { differenceInDays, parseISO, differenceInHours } from 'date-fns';

// ─── Configure how notifications appear when the app is in the foreground ───
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  /**
   * Request permission to send notifications.
   * Must be called before scheduling any notification.
   * Returns true if permission was granted, false otherwise.
   */
  static async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }

    // Android requires a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('expiry-alerts', {
        name: 'Expiry Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2ECC71',
        sound: 'default',
        description: 'Notifications for food items about to expire',
      });
    }

    return true;
  }

  /**
   * Schedule expiry notifications for all food items.
   * Cancels all existing scheduled notifications first to avoid duplicates,
   * then schedules fresh notifications for items expiring within 3 days.
   */
  static async scheduleExpiryNotifications(items: FoodItem[]): Promise<void> {
    // Cancel all previously scheduled notifications to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = new Date();

    for (const item of items) {
      const expiryDate = parseISO(item.expiryDate);
      const daysLeft = differenceInDays(expiryDate, now);

      // Already expired → send immediate notification
      if (daysLeft < 0) {
        await this.sendImmediateNotification(
          `🚨 ${item.name} has expired!`,
          `${item.name} expired ${Math.abs(daysLeft)} day(s) ago. Consider discarding or composting it.`,
          { itemId: item.id, type: 'expired' }
        );
      }
      // Expires today → send immediate notification
      else if (daysLeft === 0) {
        await this.sendImmediateNotification(
          `⚠️ ${item.name} expires today!`,
          `Use ${item.name} (${item.quantity} ${item.unit}) today before it goes bad. Check recipes for ideas!`,
          { itemId: item.id, type: 'today' }
        );
      }
      // Expires tomorrow → schedule for 9 AM tomorrow
      else if (daysLeft === 1) {
        await this.scheduleNotification(
          `⏰ ${item.name} expires tomorrow!`,
          `Don't forget — ${item.name} (${item.quantity} ${item.unit}) expires tomorrow. Cook it or donate it!`,
          { itemId: item.id, type: 'tomorrow' },
          1 // 1 day from now
        );
      }
      // Expires in 2-3 days → schedule a reminder
      else if (daysLeft <= 3) {
        await this.scheduleNotification(
          `📋 ${item.name} expires in ${daysLeft} days`,
          `${item.name} (${item.quantity} ${item.unit}) in your ${item.category} will expire in ${daysLeft} days. Plan ahead!`,
          { itemId: item.id, type: 'soon' },
          daysLeft - 1 // Remind 1 day before the expiry threshold
        );
      }
    }
  }

  /**
   * Send a notification immediately (for already-expired or expires-today items).
   */
  static async sendImmediateNotification(
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
        ...(Platform.OS === 'android' && { channelId: 'expiry-alerts' }),
      },
      trigger: null, // null = send immediately
    });
  }

  /**
   * Schedule a notification for a future time.
   * @param daysFromNow - Number of days from now to fire the notification
   */
  static async scheduleNotification(
    title: string,
    body: string,
    data: Record<string, string>,
    daysFromNow: number
  ): Promise<void> {
    const triggerSeconds = Math.max(daysFromNow * 24 * 60 * 60, 60); // minimum 60 seconds

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        ...(Platform.OS === 'android' && { channelId: 'expiry-alerts' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: triggerSeconds,
      },
    });
  }

  /**
   * Send a donation confirmation notification.
   */
  static async sendDonationNotification(ngoName: string, itemCount: number): Promise<void> {
    await this.sendImmediateNotification(
      '🎉 Donation Confirmed!',
      `Thank you! Your ${itemCount} item(s) donation to ${ngoName} has been recorded. You're making a difference!`,
      { type: 'donation' }
    );
  }

  /**
   * Send a welcome notification for new users.
   */
  static async sendWelcomeNotification(userName: string): Promise<void> {
    await this.sendImmediateNotification(
      `🌿 Welcome to FoodSaver, ${userName}!`,
      'Start by adding food items to your inventory. We\'ll notify you before anything expires!',
      { type: 'welcome' }
    );
  }

  /**
   * Cancel all scheduled notifications (useful on logout).
   */
  static async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get the count of pending scheduled notifications.
   */
  static async getPendingCount(): Promise<number> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.length;
  }
}
