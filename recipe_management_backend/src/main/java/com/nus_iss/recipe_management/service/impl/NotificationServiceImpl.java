package com.nus_iss.recipe_management.service.impl;

import com.nus_iss.recipe_management.model.*;
import com.nus_iss.recipe_management.repository.NotificationPreferencesRepository;
import com.nus_iss.recipe_management.repository.NotificationRepository;
import com.nus_iss.recipe_management.service.MealPlanService;
import com.nus_iss.recipe_management.service.NotificationService;
import com.nus_iss.recipe_management.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RequiredArgsConstructor
@Slf4j
@Service
public class NotificationServiceImpl implements NotificationService {

    private final UserService userService;

    private final MealPlanService mealPlanService;

    @Autowired
    private NotificationPreferencesRepository notificationPreferencesRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public NotificationPreferences getPreferences(Integer userId) {
        return notificationPreferencesRepository.findByUserUserId(userId).orElse(new NotificationPreferences());
    }

    @Override
    public NotificationPreferences createPreferences(NotificationPreferences notificationPreferences, Integer userId) {

        // 🔐 Get the currently authenticated user's ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        User user = userService.findByEmail(username).orElseThrow(() ->
                new AuthenticationCredentialsNotFoundException("Value not present"));

        // Check if the authenticated user owns the recipe
        if (!notificationPreferences.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to modify this recipe.");
        }

        notificationPreferences.setUser(user);
        return notificationPreferencesRepository.save(notificationPreferences);
    }

    @Override
    public NotificationPreferences updatePreferences(NotificationPreferences notificationPreferences, Integer userId) {

        // 🔐 Get the currently authenticated user's ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((UserDetails) authentication.getPrincipal()).getUsername();
        User user = userService.findByEmail(username).orElseThrow(() ->
                new AuthenticationCredentialsNotFoundException("User not found"));

        // Check if the authenticated user owns the recipe
        if (!notificationPreferences.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to modify this recipe.");
        }

        notificationPreferences.setUser(user);
        return notificationPreferencesRepository.save(notificationPreferences);
    }

    @Override
    public Notification createNotification(String title, String description, Integer userId, Integer mealPlanId, Boolean notificationSentIndicator){
        User user = userService.getUserById(userId);
        MealPlan mealPlan = mealPlanService.getMealPlanById(mealPlanId);
        Notification notification = new Notification(title, description, user, mealPlan, notificationSentIndicator);

        return notificationRepository.save(notification);
    }

    @Override
    public Notification updateNotificationSentFlagByNotificationId(Integer notificationId, Boolean notificationSentIndicator){
        Optional<Notification> optionalNotification = notificationRepository.findById(notificationId);
        Notification notification = optionalNotification.orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setNotificationSentIndicator(notificationSentIndicator);
        return notificationRepository.save(notification);
    }

    @Override
    public Integer updateNotificationFlagForUserToTrue(Integer userId){
        return notificationRepository.updateNotificationFlagForUserToTrue(userId);
    }

    @Override
    public List<Notification> getUnsentNotificationForUser(Integer userId){
        return notificationRepository.findUnsentNotificationsByUserId(userId);
    }

    @Override
    public List<Notification> getAllNotificationForUser(Integer userId){
        return notificationRepository.findNotificationsByUserId(userId);
    }

    @Override
    public List<Notification> getAllNotifications(){
        return notificationRepository.findAll();
    }

    @Override
    public Optional<Notification> getNotificationById(Integer notificationId){
        return notificationRepository.findById(notificationId);
    }

    public void deleteNotification(Integer notificationId){
        notificationRepository.deleteById(notificationId);
    }

    public void generateMealPlanNotificationsForUser(Integer userId) {
        User user = userService.getUserById(userId);
        NotificationPreferences notificationPreferences = user.getNotificationPreferences();

        if(!notificationPreferences.isEnabled() || !notificationPreferences.isMealPlanReminderNotification()) {
            return;
        }

        Set<MealPlan> mealPlans = user.getMealPlans();
        for (MealPlan mealPlan: mealPlans) {
            Frequency frequency = mealPlan.getFrequency();
            Set<Notification> notifications = mealPlan.getNotifications();
            Optional<Notification> mostRecentNotificationOptional = notifications.stream()
                    .sorted(Comparator.comparing(Notification::getCreatedAt).reversed())
                    .findFirst();
            Notification mostRecentNotification = mostRecentNotificationOptional.orElse(null);
            if(mostRecentNotification != null) {
                switch (frequency) {
                    case DAILY:
                        if(hasDaysPassed(mostRecentNotification.getCreatedAt(), 1)) {
                            createNotification(mealPlan.getTitle(), mealPlan.toString(), userId, mealPlan.getMealPlanId(), false);
                        }
                        break;
                    case WEEKLY:
                        if(hasWeeksPassed(mostRecentNotification.getCreatedAt(), 1)) {
                            createNotification(mealPlan.getTitle(), mealPlan.toString(), userId, mealPlan.getMealPlanId(), false);
                        }
                        break;
                    case BI_WEEKLY:
                        if(hasWeeksPassed(mostRecentNotification.getCreatedAt(), 2)) {
                            createNotification(mealPlan.getTitle(), mealPlan.toString(), userId, mealPlan.getMealPlanId(), false);
                        }
                        break;
                    case MONTHLY:
                        if(hasMonthsPassed(mostRecentNotification.getCreatedAt(), 1)) {
                            createNotification(mealPlan.getTitle(), mealPlan.toString(), userId, mealPlan.getMealPlanId(), false);
                        }
                        break;
                    case QUARTERLY:
                        if(hasMonthsPassed(mostRecentNotification.getCreatedAt(), 3)) {
                            createNotification(mealPlan.getTitle(), mealPlan.toString(), userId, mealPlan.getMealPlanId(), false);
                        }
                        break;
                    case YEARLY:
                        if(hasMonthsPassed(mostRecentNotification.getCreatedAt(), 12)) {
                            createNotification(mealPlan.getTitle(), mealPlan.toString(), userId, mealPlan.getMealPlanId(), false);
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }

    public boolean hasDaysPassed(LocalDateTime dateTime, Integer days) {
        // Get the current time
        LocalDateTime now = LocalDateTime.now();

        // Calculate the duration between the given time and now
        Duration duration = Duration.between(dateTime, now);

        // Check if the duration is greater than or equal to 1 day
        return duration.toDays() >= days;
    }

    public boolean hasWeeksPassed(LocalDateTime dateTime, Integer weeks) {
        // Get the current time
        LocalDateTime now = LocalDateTime.now();

        // Calculate the difference in weeks
        long weeksBetween = ChronoUnit.WEEKS.between(dateTime, now);

        // Check if at least one week has passed
        return weeksBetween >= weeks;
    }

    public boolean hasMonthsPassed(LocalDateTime dateTime, Integer months) {
        // Get the current time
        LocalDateTime now = LocalDateTime.now();

        // Calculate the period between the two LocalDateTimes
        Period period = Period.between(dateTime.toLocalDate(), now.toLocalDate());

        // Check if at least one month has passed
        return period.getMonths() >= months;
    }
}
