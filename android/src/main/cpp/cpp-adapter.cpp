#include <jni.h>
#include "DynamicActivitiesOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::dynamicactivities::initialize(vm);
}
