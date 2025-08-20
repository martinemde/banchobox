Bancho Box — iOS App

This directory is reserved for the native iOS app.

What I need from you:
- Provide an "iOS husk" (an empty Xcode project/workspace) by dropping it into this `ios/` folder.
- Any of these structures are fine:
  - `BanchoBox.xcodeproj` + `BanchoBox/` sources
  - Or a `.xcworkspace` (CocoaPods/SPM/Carthage is fine)
  - SwiftUI or UIKit — your choice

After you add the husk:
- I will wire up a `WKWebView`/app shell to host Bancho Box,
  connect build steps to bundle the web assets, and handle offline caching.

Notes:
- Please avoid using Xcode CLI install flows; we will use Xcode's Run/Install button.
- This repo already contains the web app; iOS integration work happens in this folder.

You can now drop in the husk. Once committed, ping me and I will proceed.


