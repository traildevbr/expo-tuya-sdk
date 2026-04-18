Pod::Spec.new do |s|
  s.name        = 'ThingSmartCryption'
  s.version     = '1.0.0'
  s.summary     = 'Mock for CI'
  s.description = 'Mock podspec for CI - no real sources needed'
  s.homepage    = 'https://github.com/tuya/tuya-pod-specs'
  s.license     = { :type => 'MIT' }
  s.authors     = { 'Tuya' => 'developer@tuya.com' }
  s.source      = { :git => 'https://github.com/tuya/tuya-pod-specs.git', :tag => s.version.to_s }
  s.platforms   = { :ios => '13.0' }
  s.preserve_paths = 'Build/**/*'
  s.vendored_frameworks = 'Build/ThingSmartCryption.xcframework'
end
