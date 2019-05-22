import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    onboardingContainer: {
        flex: 1,
        height: '100%',
        width: '100%',
    },
    onboardingActionsRow: {
        flexDirection: 'row',
    },
    onboardingPrimaryAction: {
        width: 250,
    },
    onboardingSecondaryAction: {
        marginLeft: 15,
        width: 150,
    },
    onboardingVisuals: {
        height: '100%',
        position: 'absolute',
        width: '100%',
    },
    onboardingPhoto: {
        height: '100%',
        paddingRight: '10%',
        width: '110%',
    },
    onboardingPhotoCycled: {
        height: '100%',
        position: 'absolute',
        width: '115%',
        top: 0,
        left: 0,
        zIndex: 3,
    },
    onboardingPhotoCruise: {
        height: '100%',
        position: 'absolute',
        width: '115%',
        top: 0,
        left: 0,
        paddingLeft: 405,
        paddingTop: 165,
        paddingRight: 120,
        zIndex: 3,
    },
    onboardingVisualLane: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 180,
        marginLeft: 127,
        width: '90%',
        zIndex: 2,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    onboardingVisualLaneZoomed: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'center',
        bottom: 0,
        left: 0,
        height: 140,
        marginLeft: 127,
        width: '90%',
        zIndex: 6,
    },
    onboardingVisualLaneTouchGate: {
        backgroundColor: 'transparent',
        zIndex: 1,
        position: 'relative',
        height: '100%',
        borderRadius: 0,
        borderWidth: 0,
        marginLeft: 127,
        width: 290,
    },
    onboardingVisualCruiseTouchGate: {
        backgroundColor: 'lime',
        zIndex: 1,
        position: 'relative',
        height: 50,
        borderRadius: 0,
        borderWidth: 0,
        width: 50,
    },
    onboardingFaceTouchGate: {
        height: 140,
        width: 140,
        position: 'absolute',
        right: 40,
        bottom: 94,
        transform: [{ rotate: '-6.25deg'}],
    },
    onboardingBrakePedalTouchGate: {
        height: 70,
        width: 100,
        position: 'absolute',
        right: 150,
        bottom: 110,
    },
    onboardingGasPedalTouchGate: {
        height: 70,
        width: 50,
        position: 'absolute',
        right: 50,
        bottom: 110,
    },
    onboardingPedalTouchGateButton: {
        backgroundColor: 'lime',
        zIndex: 1,
        position: 'relative',
        borderRadius: 0,
        borderWidth: 0,
        height: '100%',
        borderRadius: 0,
        borderWidth: 0,
        width: '100%',
    },
    onboardingVisualLead: {
        position: 'absolute',
        bottom: 155,
        left: 0,
        height: 18,
        marginLeft: 425,
        width: 30,
        zIndex: 7,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    onboardingVisualLeadZoomed: {
        height: 15,
        left: 1,
        width: 28,
        zIndex: 8,
    },
    onboardingVisualLeadTouchGate: {
        position: 'absolute',
        bottom: 150,
        left: 0,
        height: 28,
        marginLeft: 420,
        width: 40,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    onboardingVisualLeadTouchGateButton: {
        backgroundColor: 'lime',
        zIndex: 1,
        position: 'relative',
        borderRadius: 0,
        borderWidth: 0,
        width: 200,
    },
    onboardingOverlay: {
        opacity: 0.85,
        position: 'relative',
        zIndex: 10,
    },
    onboardingOverlayCollapsed: {
        width: '53%',
    },
    onboardingStep: {},
    onboardingStepContext: {
        paddingTop: '5%',
        paddingBottom: '10%',
    },
    onboardingStepContextSmall: {
        paddingTop: '2%',
        paddingBottom: '5%',
    },
    onboardingStepContextSmaller: {
        paddingTop: '5%',
    },
    onboardingStepButton: {
        width: 233,
    },
    onboardingStepPoint: {
        flexDirection: 'row',
        paddingBottom: '5%',
        paddingRight: '15%',
    },
    onboardingStepPointSmall: {
        flexDirection: 'column',
        paddingLeft: '10%',
        paddingTop: '5%',
        paddingRight: '8%',
        paddingBottom: '5%',
    },
    onboardingStepPointCrumb: {
        opacity: 0.5,
    },
    onboardingStepPointChain: {
        alignItems: 'center',
        flexDirection: 'column',
        marginLeft: '5%',
        marginRight: '5%',
        width: 40,
    },
    onboardingStepPointChainPrevious: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        height: 40,
        paddingTop: 10,
        paddingBottom: 5,
        opacity: 0.15,
        width: '100%',
    },
    onboardingStepPointChainPreviousIcon: {
        height: '70%',
        transform: [{ rotate: '-90deg'}],
        width: '100%',
    },
    onboardingStepPointChainNumber: {
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,.1)',
        borderRadius: 20,
        display: 'flex',
        height: 40,
        justifyContent: 'center',
        width: 40,
    },
    onboardingStepPointBody: {
        display: 'flex',
        paddingRight: '8%',
        paddingTop: '9%',
    },
    onboardingStepPointInstruction: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingTop: '10%',
    },
    onboardingStepPointInstructionText: {

    },
    onboardingStepPointInstructionIcon: {
        height: 10,
        marginLeft: '5%',
        width: 10,
    },
    onboardingSplashView: {
        paddingTop: '11%',
        paddingLeft: '11%',
        paddingRight: '13%',
    },
    onboardingOutroView: {
        paddingTop: '8%',
        paddingLeft: '11%',
        paddingRight: '7%',
    },
})
