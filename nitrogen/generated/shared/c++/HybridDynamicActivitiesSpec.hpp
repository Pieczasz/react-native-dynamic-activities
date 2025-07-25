///
/// HybridDynamicActivitiesSpec.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#if __has_include(<NitroModules/HybridObject.hpp>)
#include <NitroModules/HybridObject.hpp>
#else
#error NitroModules cannot be found! Are you sure you installed NitroModules properly?
#endif





namespace margelo::nitro::dynamicactivities {

  using namespace margelo::nitro;

  /**
   * An abstract base class for `DynamicActivities`
   * Inherit this class to create instances of `HybridDynamicActivitiesSpec` in C++.
   * You must explicitly call `HybridObject`'s constructor yourself, because it is virtual.
   * @example
   * ```cpp
   * class HybridDynamicActivities: public HybridDynamicActivitiesSpec {
   * public:
   *   HybridDynamicActivities(...): HybridObject(TAG) { ... }
   *   // ...
   * };
   * ```
   */
  class HybridDynamicActivitiesSpec: public virtual HybridObject {
    public:
      // Constructor
      explicit HybridDynamicActivitiesSpec(): HybridObject(TAG) { }

      // Destructor
      ~HybridDynamicActivitiesSpec() override = default;

    public:
      // Properties
      

    public:
      // Methods
      virtual double sum(double num1, double num2) = 0;

    protected:
      // Hybrid Setup
      void loadHybridMethods() override;

    protected:
      // Tag for logging
      static constexpr auto TAG = "DynamicActivities";
  };

} // namespace margelo::nitro::dynamicactivities
