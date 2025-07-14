export class VisualFeedbackManager {
    constructor(scene) {
        this.scene = scene;
        this.activeEffects = [];
    }

    // タッチリップルエフェクト
    showTouchRipple(x, y, color = 0x00FF00, duration = 400) {
        const ripple = this.scene.add.circle(x, y, 10, 0x00FF00, 0.7);
        ripple.setDepth(9999); // 最前面に
        this.scene.tweens.add({
            targets: ripple,
            scaleX: 5,
            scaleY: 5,
            alpha: 0,
            duration: duration,
            ease: 'Power2',
            onComplete: () => {
                ripple.destroy();
            }
        });
        this.activeEffects.push(ripple);
        // SE再生はそのまま
        if (this.scene.audioManager && this.scene.audioManager.playSe) {
            try {
                this.scene.audioManager.playSe('se_map_touch', 0.3);
            } catch (error) {
                this.scene.audioManager.playSe('se_touch', 0.3);
            }
        }
    }

    // ボタンホバーエフェクト
    showButtonHover(target, scale = 1.2, color = 0xFFD700, alpha = 0.7) {
        if (target.setScale) target.setScale(scale);
        if (target.setFillStyle) target.setFillStyle(color, alpha);
    }

    // ボタンリセット
    resetButtonState(target, scale = 1, color = 0x4169E1, alpha = 0.7) {
        if (target.setScale) target.setScale(scale);
        if (target.setFillStyle) target.setFillStyle(color, alpha);
    }

    // 選択エフェクト（パルス）
    showSelectionEffect(x, y, color = 0xFFFF00, stroke = 0xFF0000) {
        const effect = this.scene.add.circle(x, y, 30, color, 0.6);
        effect.setStrokeStyle(4, stroke);
        this.scene.tweens.add({
            targets: effect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                effect.destroy();
            }
        });
        this.activeEffects.push(effect);
    }
} 