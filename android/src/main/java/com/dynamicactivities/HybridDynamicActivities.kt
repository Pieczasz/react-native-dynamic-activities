package com.dynamicactivities

import com.margelo.nitro.core.Promise
import com.margelo.nitro.dynamicactivities.HybridDynamicActivitiesSpec
import com.margelo.nitro.dynamicactivities.LiveActivitiesSupportInfo
import com.margelo.nitro.dynamicactivities.LiveActivityAlertConfiguration
import com.margelo.nitro.dynamicactivities.LiveActivityAttributes
import com.margelo.nitro.dynamicactivities.LiveActivityContent
import com.margelo.nitro.dynamicactivities.LiveActivityDismissalPolicy
import com.margelo.nitro.dynamicactivities.LiveActivityPushToken
import com.margelo.nitro.dynamicactivities.LiveActivityStartResult
import com.margelo.nitro.dynamicactivities.LiveActivityStyle

class HybridDynamicActivities : HybridDynamicActivitiesSpec() {
    override fun areLiveActivitiesSupported(): Promise<LiveActivitiesSupportInfo> {
        val promise = Promise<LiveActivitiesSupportInfo>()
        promise.resolve(LiveActivitiesSupportInfo(false, 0.0, "Live Activities are not supported on Android"))
        return promise
    }

    override fun startLiveActivity(
        attributes: LiveActivityAttributes,
        content: LiveActivityContent,
        pushToken: LiveActivityPushToken?,
        style: LiveActivityStyle?,
        alertConfiguration: LiveActivityAlertConfiguration?,
        start: java.time.Instant?,
    ): Promise<LiveActivityStartResult> {
        val promise = Promise<LiveActivityStartResult>()
        promise.reject(UnsupportedOperationException("Live Activities are iOS-only."))
        return promise
    }

    override fun updateLiveActivity(
        activityId: String,
        content: LiveActivityContent,
        alertConfiguration: LiveActivityAlertConfiguration?,
        timestamp: java.time.Instant?,
    ): Promise<Unit> {
        val promise = Promise<Unit>()
        promise.reject(UnsupportedOperationException("Live Activities are iOS-only."))
        return promise
    }

    override fun endLiveActivity(
        activityId: String,
        content: LiveActivityContent,
        dismissalPolicy: LiveActivityDismissalPolicy?,
        timestamp: java.time.Instant?,
        dismissalDate: java.time.Instant?,
    ): Promise<Unit> {
        val promise = Promise<Unit>()
        promise.reject(UnsupportedOperationException("Live Activities are iOS-only."))
        return promise
    }
}
