import ActivityKit
import SwiftUI
import WidgetKit

struct {{ACTIVITY_NAME}}LiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: {{ACTIVITY_NAME}}Attributes.self) { context in
            // Lock Screen/Banner UI
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(context.attributes.title)
                        .font(.headline)
                        .foregroundColor(.primary)
                    Spacer()
                    Text(context.state.state.capitalized)
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(context.state.state == "active" ? Color.green : Color.gray)
                        )
                        .foregroundColor(.white)
                }
                
                Text(context.attributes.body)
                    .font(.body)
                    .foregroundColor(.secondary)
                
                if let relevanceScore = context.state.relevanceScore {
                    HStack {
                        Text("Progress")
                            .font(.caption)
                        Spacer()
                        Text("\(Int(relevanceScore * 100))%")
                            .font(.caption)
                            .fontWeight(.semibold)
                    }
                    
                    ProgressView(value: relevanceScore)
                        .progressViewStyle(LinearProgressViewStyle(tint: .blue))
                }
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(.systemBackground))
            )
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI
                DynamicIslandExpandedRegion(.leading) {
                    VStack(alignment: .leading) {
                        Text(context.attributes.title)
                            .font(.caption)
                            .fontWeight(.semibold)
                        Text(context.state.state.capitalized)
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing) {
                        if let relevanceScore = context.state.relevanceScore {
                            Text("\(Int(relevanceScore * 100))%")
                                .font(.caption)
                                .fontWeight(.semibold)
                            ProgressView(value: relevanceScore)
                                .progressViewStyle(LinearProgressViewStyle(tint: .blue))
                                .frame(width: 40)
                        }
                    }
                }
                DynamicIslandExpandedRegion(.center) {
                    Text(context.attributes.body)
                        .font(.caption)
                        .multilineTextAlignment(.center)
                }
            } compactLeading: {
                // Compact leading
                Text(context.attributes.title.prefix(1))
                    .font(.caption2)
                    .fontWeight(.semibold)
            } compactTrailing: {
                // Compact trailing
                if context.state.state == "active" {
                    Image(systemName: "play.fill")
                        .foregroundColor(.green)
                        .font(.caption2)
                } else {
                    Image(systemName: "pause.fill")
                        .foregroundColor(.gray)
                        .font(.caption2)
                }
            } minimal: {
                // Minimal
                Text(context.attributes.title.prefix(1))
                    .font(.caption2)
                    .fontWeight(.semibold)
            }
        }
    }
}

// Preview
#if DEBUG
struct {{ACTIVITY_NAME}}LiveActivity_Previews: PreviewProvider {
    static let attributes = {{ACTIVITY_NAME}}Attributes(
        title: "Sample Activity",
        body: "This is a preview of your Live Activity"
    )
    
    static let contentState = {{ACTIVITY_NAME}}Attributes.ContentState(
        state: "active",
        relevanceScore: 0.75
    )
    
    static var previews: some View {
        attributes
            .previewContext(contentState, viewKind: .dynamicIsland(.compact))
            .previewDisplayName("Island Compact")
        
        attributes
            .previewContext(contentState, viewKind: .dynamicIsland(.expanded))
            .previewDisplayName("Island Expanded")
        
        attributes
            .previewContext(contentState, viewKind: .dynamicIsland(.minimal))
            .previewDisplayName("Island Minimal")
    }
}
#endif