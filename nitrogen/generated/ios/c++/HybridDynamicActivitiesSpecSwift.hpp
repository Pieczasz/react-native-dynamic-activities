///
/// HybridDynamicActivitiesSpecSwift.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#include "HybridDynamicActivitiesSpec.hpp"

// Forward declaration of `HybridDynamicActivitiesSpec_cxx` to properly resolve imports.
namespace DynamicActivities { class HybridDynamicActivitiesSpec_cxx; }





#include "DynamicActivities-Swift-Cxx-Umbrella.hpp"

namespace margelo::nitro::dynamicactivities {

  /**
   * The C++ part of HybridDynamicActivitiesSpec_cxx.swift.
   *
   * HybridDynamicActivitiesSpecSwift (C++) accesses HybridDynamicActivitiesSpec_cxx (Swift), and might
   * contain some additional bridging code for C++ <> Swift interop.
   *
   * Since this obviously introduces an overhead, I hope at some point in
   * the future, HybridDynamicActivitiesSpec_cxx can directly inherit from the C++ class HybridDynamicActivitiesSpec
   * to simplify the whole structure and memory management.
   */
  class HybridDynamicActivitiesSpecSwift: public virtual HybridDynamicActivitiesSpec {
  public:
    // Constructor from a Swift instance
    explicit HybridDynamicActivitiesSpecSwift(const DynamicActivities::HybridDynamicActivitiesSpec_cxx& swiftPart):
      HybridObject(HybridDynamicActivitiesSpec::TAG),
      _swiftPart(swiftPart) { }

  public:
    // Get the Swift part
    inline DynamicActivities::HybridDynamicActivitiesSpec_cxx& getSwiftPart() noexcept {
      return _swiftPart;
    }

  public:
    // Get memory pressure
    inline size_t getExternalMemorySize() noexcept override {
      return _swiftPart.getMemorySize();
    }

  public:
    // Properties
    

  public:
    // Methods
    inline double sum(double num1, double num2) override {
      auto __result = _swiftPart.sum(std::forward<decltype(num1)>(num1), std::forward<decltype(num2)>(num2));
      if (__result.hasError()) [[unlikely]] {
        std::rethrow_exception(__result.error());
      }
      auto __value = std::move(__result.value());
      return __value;
    }

  private:
    DynamicActivities::HybridDynamicActivitiesSpec_cxx _swiftPart;
  };

} // namespace margelo::nitro::dynamicactivities
