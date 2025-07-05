import { NitroModules } from 'react-native-nitro-modules'
import type { DynamicActivities as DynamicActivitiesSpec } from './specs/dynamic-activities.nitro'

export const DynamicActivities =
  NitroModules.createHybridObject<DynamicActivitiesSpec>('DynamicActivities')
