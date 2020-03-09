import React, { Component } from 'react';
import { View, Animated } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';

import ChffrPlus from '../../..//native/ChffrPlus';
import { completeTrainingStep } from '../step';
import { onTrainingRouteCompleted } from '../../../utils/version';

import X from '../../../themes';
import Styles from './OnboardingStyles';

const Step = {
    OB_SPLASH: 'OB_SPLASH',
    OB_INTRO: 'OB_INTRO',
    OB_SENSORS: 'OB_SENSORS',
    OB_ENGAGE: 'OB_ENGAGE',
    OB_LANECHANGE: 'OB_LANECHANGE',
    OB_DISENGAGE: 'OB_DISENGAGE',
    OB_OUTRO: 'OB_OUTRO',
};

class Onboarding extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            step: Step.OB_SPLASH,
            stepPoint: 0,
            stepChecks: [],
            engagedMocked: false,
            photoOffset: new Animated.Value(0),
            photoCycled: new Animated.Value(0),
            photoCycledLast: new Animated.Value(0),
            leadEntered: new Animated.Value(0),
            gateHighlighted: new Animated.Value(0),
        };
    }

    componentWillMount() {
        this.handleEngagedMocked(false);
    }

    componentWillUnmount() {
        this.handleEngagedMocked(false);
    }

    setStep(step) {
        this.setState({
            step: '',
            stepChecks: [],
        }, () => {
            return this.setState({ step });
        });
    }

    setStepPoint(stepPoint) {
        this.setState({
            stepPoint: 0,
        }, () => {
            return this.setState({ stepPoint });
        })
    }

    handleRestartPressed = () => {
        this.props.restartTraining();
        this.setStep('OB_SPLASH');
    }

    handleIntroCheckboxPressed(stepCheck) {
        const { stepChecks } = this.state;
        if (stepChecks.indexOf(stepCheck) === -1) {
            const newStepChecks = [...stepChecks, stepCheck];
            this.setState({ stepChecks: newStepChecks });
            if (newStepChecks.length == 3) {
                setTimeout(() => {
                    this.setStep('OB_SENSORS');
                }, 300)
            }
        } else {
            stepChecks.splice(stepChecks.indexOf(stepCheck), 1);
            this.setState({ stepChecks });
        }
    }

    handleSensorRadioPressed(option) {
        switch(option) {
            case 'index':
                this.animatePhotoOffset(0);
                this.animatePhotoCycled(0);
                return this.setStepPoint(0); break;
            case 'camera':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(0);
                return this.setStepPoint(1); break;
            case 'radar':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(100);
                this.animateLeadEntered(100);
                return this.setStepPoint(2); break;
        }
    }

    handleEngageRadioPressed(option) {
        switch(option) {
            case 'index':
                this.animatePhotoOffset(0);
                this.animatePhotoCycled(0);
                this.animatePhotoCycledLast(0);
                return this.setStepPoint(0); break;
            case 'cruise':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(0);
                return this.setStepPoint(1); break;
            case 'monitoring':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(100);
                return this.setStepPoint(2); break;
        }
    }

    handleLaneChangeRadioPressed(option) {
        switch(option) {
            case 'index':
                this.animatePhotoOffset(0);
                this.animatePhotoCycled(0);
                this.animatePhotoCycledLast(0);
                return this.setStepPoint(0); break;
            case 'start':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(0);
                this.animatePhotoCycledLast(0);
                return this.setStepPoint(1); break;
            case 'perform':
                this.animatePhotoOffset(0);
                this.animatePhotoCycled(100);
                this.animatePhotoCycledLast(0);
                return this.setStepPoint(2); break;
        }
    }

    handleDisengageRadioPressed(option) {
        switch(option) {
            case 'index':
                this.animatePhotoOffset(0);
                this.animatePhotoCycled(0);
                this.animatePhotoCycledLast(0);
                return this.setStepPoint(0); break;
            case 'limitations':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(0);
                return this.setStepPoint(1); break;
            case 'disengage':
                this.animatePhotoOffset(100);
                this.animatePhotoCycledLast(100);
                return this.setStepPoint(2); break;
        }
    }

    handleSensorVisualPressed(visual) {
        const { stepChecks } = this.state;
        const hasCheck = (stepChecks.indexOf(visual) > -1);
        if (stepChecks.length > 0 && !hasCheck) {
            this.animatePhotoOffset(0);
            this.setState({ stepChecks: [...stepChecks, visual] });
            this.setStepPoint(0);
            return this.setStep('OB_ENGAGE');
        } else {
            this.setState({ stepChecks: [...stepChecks, visual] });
            switch(visual) {
                case 'camera':
                    this.animatePhotoCycled(100);
                    this.animateLeadEntered(100);
                    return this.setStepPoint(2); break;
                case 'radar':
                    this.animatePhotoOffset(0);
                    this.animateLeadEntered(0);
                    this.animatePhotoCycled(0);
                    this.setStepPoint(0);
                    return this.setStep('OB_ENGAGE'); break;
            }
        }
    }

    handleEngageVisualPressed(visual) {
        const { stepChecks } = this.state;
        const hasCheck = (stepChecks.indexOf(visual) > -1);
        this.setState({ stepChecks: [...stepChecks, visual] });
        switch(visual) {
            case 'cruise':
                this.animatePhotoCycled(100);
                this.handleEngagedMocked(true);
                return this.setStepPoint(2); break;
            case 'monitoring':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(100);
                this.animatePhotoCycledLast(100);
                this.setStepPoint(0);
                return this.setStep('OB_LANECHANGE'); break;
        }
    }

    handleLaneChangeVisualPressed(visual) {
        const { stepChecks } = this.state;
        const hasCheck = (stepChecks.indexOf(visual) > -1);
        this.setState({ stepChecks: [...stepChecks, visual] });
        switch(visual) {
            case 'start':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(100);
                this.animatePhotoCycledLast(100);
                return this.setStepPoint(2); break;
            case 'perform':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(100);
                this.animatePhotoCycledLast(100);
                this.setStepPoint(0);
                return this.setStep('OB_DISENGAGE'); break;
        }
    }

    handleDisengageVisualPressed(visual) {
        const { stepChecks } = this.state;
        const hasCheck = (stepChecks.indexOf(visual) > -1);
        this.setState({ stepChecks: [...stepChecks, visual] });
        switch(visual) {
            case 'limitations':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(100);
                this.animatePhotoCycledLast(100);
                return this.setStepPoint(2); break;
            case 'disengage':
                this.animatePhotoOffset(0);
                this.animatePhotoCycled(0);
                this.animatePhotoCycledLast(0);
                this.handleEngagedMocked(false);
                this.setStepPoint(0);
                return this.setStep('OB_OUTRO'); break;
        }
    }

    animatePhotoOffset(offset) {
        const { photoOffset } = this.state;
        Animated.timing(
            photoOffset,
            {
                toValue: offset,
                duration: 1000,
            }
        ).start();
    }

    animatePhotoCycled(offset) {
        const { photoCycled } = this.state;
        Animated.timing(
            photoCycled,
            {
                toValue: offset,
                duration: 800,
            }
        ).start();
    }

    animatePhotoCycledLast(offset) {
        const { photoCycledLast } = this.state;
        Animated.timing(
            photoCycledLast,
            {
                toValue: offset,
                duration: 800,
            }
        ).start();
    }

    animateLeadEntered(offset) {
        const { leadEntered } = this.state;
        Animated.timing(
            leadEntered,
            {
                toValue: offset,
                duration: 500,
            }
        ).start();
    }

    animateTouchGateHighlighted(amount) {
        const { gateHighlighted } = this.state;
        Animated.sequence([
          Animated.timing(
            gateHighlighted,
            {
              toValue: amount,
              duration: 300,
            }
          ),
          Animated.timing(
              gateHighlighted,
              {
                  toValue: 0,
                  duration: 500,
              }
          )
        ]).start()
    }

    handleWrongGatePressed() {
        this.animateTouchGateHighlighted(50);
    }

    handleEngagedMocked(shouldMock) {
        this.setState({ engagedMocked: shouldMock })
        if (shouldMock) {
            ChffrPlus.sendBroadcast("ai.comma.plus.frame.ACTION_ENGAGED_MOCKED");
        } else {
            ChffrPlus.sendBroadcast("ai.comma.plus.frame.ACTION_ENGAGED_UNMOCKED");
        }
    }

    renderSplashStep() {
        return (
            <X.Entrance style={ Styles.onboardingSplashView }>
                <X.Text
                    size='jumbo' color='white' weight='bold'
                    style={ Styles.onboardingStepHeader }>
                    欢迎使用 wepilot
                </X.Text>
                <X.Text
                    color='white' weight='light'
                    style={ Styles.onboardingStepContext }>
                    在使用wepilot之前，您需要了解wepilot自动驾驶适用的场景，提供的功能，以及相应的操作方式。
                </X.Text>
                <View style={ Styles.onboardingPrimaryAction }>
                    <X.Button
                        color='setupPrimary'
                        onPress={ () => this.setStep('OB_INTRO') }>
                        点击继续
                    </X.Button>
                </View>
            </X.Entrance>
        )
    }

    renderIntroStep() {
        const { stepChecks } = this.state;
        return (
            <X.Entrance style={ Styles.onboardingStep }>
                <View style={ Styles.onboardingStepPoint }>
                    <View style={ Styles.onboardingStepPointChain }>
                        <X.Button
                            size='small' color='ghost'
                            style={ Styles.onboardingStepPointChainPrevious }
                            onPress={ () => this.setStep('OB_SPLASH') }>
                            <X.Image
                                source={ require('../../../img/icon_chevron_right.png') }
                                style={ Styles.onboardingStepPointChainPreviousIcon } />
                        </X.Button>
                        <View style={ Styles.onboardingStepPointChainNumber }>
                            <X.Text color='white' weight='semibold'>
                                1
                            </X.Text>
                        </View>
                    </View>
                    <View style={ Styles.onboardingStepPointBody }>
                        <X.Text size='bigger' color='white' weight='bold'>
                            wepilot是一个自动辅助驾驶系统.
                        </X.Text>
                        <X.Text
                            size='smallish' color='white' weight='light'
                            style={ Styles.onboardingStepContextSmall }>
                            自动驾驶并不是无人驾驶，在wepilot替您驾驶车辆的过程中，您需要时刻保持关注并做好接管车辆控制的准备。
                        </X.Text>
                        <X.CheckboxField
                            size='small'
                            color='white'
                            isChecked={ stepChecks.includes(1) }
                            onPress={ () => this.handleIntroCheckboxPressed(1) }
                            label='我会保持关注路况.' />
                        <X.CheckboxField
                            size='small'
                            color='white'
                            isChecked={ stepChecks.includes(2) }
                            onPress={ () => this.handleIntroCheckboxPressed(2) }
                            label='我会随时准备好接管车辆控制.' />
                        <X.CheckboxField
                            size='small'
                            color='white'
                            isChecked={ stepChecks.includes(3) }
                            onPress={ () => this.handleIntroCheckboxPressed(3) }
                            label='我会随时准备好接管车辆控制!' />
                    </View>
                </View>
            </X.Entrance>
        )
    }

    renderSensorsStepPointIndex() {
        const { stepChecks } = this.state;
        return (
            <View style={ Styles.onboardingStepPoint }>
                <View style={ Styles.onboardingStepPointChain }>
                    <X.Button
                        size='small' color='ghost'
                        style={ Styles.onboardingStepPointChainPrevious }
                        onPress={ () => this.setStep('OB_INTRO') }>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointChainPreviousIcon } />
                    </X.Button>
                    <View style={ Styles.onboardingStepPointChainNumber }>
                        <X.Text color='white' weight='semibold'>
                            2
                        </X.Text>
                    </View>
                </View>
                <View style={ Styles.onboardingStepPointBody }>
                    <X.Text size='bigger' color='white' weight='bold'>
                        wepilot使用多种传感器来判断当前路况.
                    </X.Text>
                    <X.Text
                        size='smallish' color='white' weight='light'
                        style={ Styles.onboardingStepContextSmall }>
                        wepilot使用摄像头和雷达来判断当前路况，在大雾，暴雨等视线不佳的天气情况下，请不要使用wepilot。
                    </X.Text>
                    <X.RadioField
                        size='big'
                        color='white'
                        isChecked={ stepChecks.includes('camera') }
                        hasAppend={ true }
                        onPress={ () => this.handleSensorRadioPressed('camera') }
                        label='摄像头' />
                    <X.RadioField
                        size='big'
                        color='white'
                        isDisabled={ !stepChecks.includes('camera') }
                        isChecked={ stepChecks.includes('radar') }
                        hasAppend={ true }
                        onPress={ () => this.handleSensorRadioPressed('radar') }
                        label='毫米波雷达' />
                </View>
            </View>
        )
    }

    renderSensorsStepPointCamera() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Button
                    size='small' color='ghost' textWeight='light'
                    style={ Styles.onboardingStepPointCrumb }
                    onPress={ () => this.handleSensorRadioPressed('index') }>
                    {/* openpilot sensors */}
                    wepilot传感器
                </X.Button>
                <X.Text size='medium' color='white' weight='bold'>
                    {/* Camera from Device */}
                    摄像头
                </X.Text>
                <X.Text
                    size='small' color='white' weight='light'
                    style={ Styles.onboardingStepContextSmaller }>
                    使用深度学习算法分析前方路况，作为自动驾驶系统决策的依据
                    {/* A vision algorithm leverages the road-facing
                    camera to determine the path to drive. */}
                </X.Text>
                <X.Text
                    size='small' color='white' weight='light'
                    style={ Styles.onboardingStepContextSmaller }>
                        绘制的车道线宽度反应了当前车道的侵袭度。
                    {/* The lane lines are drawn with varying widths to
                    reflect the confidence in finding your lane. */}
                </X.Text>
                <X.Button color='ghost'
                    style={ Styles.onboardingStepPointInstruction }
                    onPress={ () => this.animateTouchGateHighlighted(100) }>
                    <X.Text
                        size='small' color='white' weight='semibold'
                        style={ Styles.onboardingStepPointInstructionText }>
                        {/* Select path to continue */}
                        点击车道线继续
                    </X.Text>
                    <X.Image
                      source={ require('../../../img/icon_chevron_right.png') }
                      style={ Styles.onboardingStepPointInstructionIcon } />
                </X.Button>
            </X.Entrance>
        )
    }

    renderSensorsStepPointRadar() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Button
                    size='small' color='ghost' textWeight='light'
                    style={ Styles.onboardingStepPointCrumb }
                    onPress={ () => this.handleSensorRadioPressed('index') }>
                    {/* openpilot sensors */}
                    wepilot 传感器
                </X.Button>
                <X.Text size='medium' color='white' weight='bold'>
                    {/* Radar from your car */}
                    毫米波雷达
                </X.Text>
                <X.Text
                    size='small' color='white' weight='light'
                    style={ Styles.onboardingStepContextSmaller }>
                    毫米波雷达用于测量前方车辆，障碍物的距离。
                    {/* The stock radar in your car helps openpilot measure
                    the lead car distance for longitudinal control. */}
                </X.Text>
                <X.Text
                    size='small' color='white' weight='light'
                    style={ Styles.onboardingStepContextSmaller }>
                    The indicator is drawn either red or yellow to
                    illustrate relative speed to the lead car.
                    
                </X.Text>
                <X.Button color='ghost'
                    style={ Styles.onboardingStepPointInstruction }
                    onPress={ () => this.handleWrongGatePressed() }>
                    <X.Text
                        size='small' color='white' weight='semibold'
                        style={ Styles.onboardingStepPointInstructionText }>
                        Select lead car indicator
                    </X.Text>
                    <X.Image
                        source={ require('../../../img/icon_chevron_right.png') }
                        style={ Styles.onboardingStepPointInstructionIcon } />
                </X.Button>
            </X.Entrance>
        )
    }

    renderSensorsStep() {
        return (
            <X.Entrance style={ Styles.onboardingStep }>
                { this.renderSensorsStepPoint() }
            </X.Entrance>
        )
    }

    renderEngagingStepPointIndex() {
        const { stepChecks } = this.state;
        return (
            <View style={ Styles.onboardingStepPoint }>
                <View style={ Styles.onboardingStepPointChain }>
                    <X.Button
                        size='small' color='ghost'
                        style={ Styles.onboardingStepPointChainPrevious }
                        onPress={ () => this.setStep('OB_SENSORS') }>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointChainPreviousIcon } />
                    </X.Button>
                    <View style={ Styles.onboardingStepPointChainNumber }>
                        <X.Text color='white' weight='semibold'>
                            3
                        </X.Text>
                    </View>
                </View>
                <View style={ Styles.onboardingStepPointBody }>
                    <X.Text size='bigger' color='white' weight='bold'>
                        点击巡航控制启动wepilot
                    </X.Text>
                    <X.Text
                        size='smallish' color='white' weight='light'
                        style={ Styles.onboardingStepContext }>
                        点击取消巡航控制或踩踏板取消wepilot
                    </X.Text>
                    <X.RadioField
                        size='big'
                        color='white'
                        isChecked={ stepChecks.includes('cruise') }
                        hasAppend={ true }
                        onPress={ () => this.handleEngageRadioPressed('cruise') }
                        label='Engage openpilot' />
                    <X.RadioField
                        size='big'
                        color='white'
                        isDisabled={ !stepChecks.includes('cruise') }
                        isChecked={ stepChecks.includes('monitoring') }
                        hasAppend={ true }
                        onPress={ () => this.handleEngageRadioPressed('monitoring') }
                        label='Driver Monitoring' />
                </View>
            </View>
        )
    }

    renderEngagingStepPointEngage() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Button
                    size='small' color='ghost' textWeight='light'
                    style={ Styles.onboardingStepPointCrumb }
                    onPress={ () => this.handleEngageRadioPressed('index') }>
                    激活自动驾驶
                </X.Button>
                <X.Text size='medium' color='white' weight='bold'>
                    激活 wepilot
                </X.Text>
                <X.Text
                    size='small' color='white' weight='light'
                    style={ Styles.onboardingStepContextSmaller }>
                    点击set激活wepilot
                </X.Text>
                <X.Button color='ghost'
                    style={ Styles.onboardingStepPointInstruction }
                    onPress={ () => this.handleWrongGatePressed() }>
                    <X.Text
                        size='small' color='white' weight='semibold'
                        style={ Styles.onboardingStepPointInstructionText }>
                       点击set
                    </X.Text>
                    <X.Image
                        source={ require('../../../img/icon_chevron_right.png') }
                        style={ Styles.onboardingStepPointInstructionIcon } />
                </X.Button>
            </X.Entrance>
        )
    }

    renderEngagingStepPointMonitoring() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Entrance>
                    <X.Button
                        size='small' color='ghost' textWeight='light'
                        style={ Styles.onboardingStepPointCrumb }
                        onPress={ () => this.handleEngageRadioPressed('index') }>
                        wepilot engaging
                    </X.Button>
                    <X.Text size='medium' color='white' weight='bold'>
                        驾驶员监控
                    </X.Text>
                    <X.Text
                        size='small' color='white' weight='light'
                        style={ Styles.onboardingStepContextSmaller }>
                        您必须在wepilot激活过程中保持注意力。
                        wepilot会检测面部和坐姿，如果长时间分心会警告并推出自动驾驶。
                        
                    </X.Text>
                    <X.Button color='ghost'
                        style={ Styles.onboardingStepPointInstruction }
                        onPress={ () => this.handleWrongGatePressed() }>
                        <X.Text
                            size='small' color='white' weight='semibold'
                            style={ Styles.onboardingStepPointInstructionText }>
                            Select face to continue
                        </X.Text>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointInstructionIcon } />
                    </X.Button>
                </X.Entrance>
            </X.Entrance>
        )
    }

    renderLaneChangeStepPointIndex() {
        const { stepChecks } = this.state;
        return (
            <View style={ Styles.onboardingStepPoint }>
                <View style={ Styles.onboardingStepPointChain }>
                    <X.Button
                        size='small' color='ghost'
                        style={ Styles.onboardingStepPointChainPrevious }
                        onPress={ () => this.setStep('OB_ENGAGE') }>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointChainPreviousIcon } />
                    </X.Button>
                    <View style={ Styles.onboardingStepPointChainNumber }>
                        <X.Text color='white' weight='semibold'>
                            4
                        </X.Text>
                    </View>
                </View>
                <View style={ Styles.onboardingStepPointBody }>
                    <X.Text size='bigger' color='white' weight='bold'>
                        切换车道，超车
                    </X.Text>
                    <X.Text
                        size='smallish' color='white' weight='light'
                        style={ Styles.onboardingStepContextSmall }>
                            朝要切换车道的方向打转向灯，并微拨方向盘，wepilot将执行自动切换车道的动作。
                            wepilot并不会检查后方是否有车。在操作前，您必须自己确认换道是否安全。
                    </X.Text>
                    <X.RadioField
                        size='big'
                        color='white'
                        isChecked={ stepChecks.includes('start') }
                        hasAppend={ true }
                        onPress={ () => this.handleLaneChangeRadioPressed('start') }
                        label='切换车道' />
                    <X.RadioField
                        size='big'
                        color='white'
                        isDisabled={ !stepChecks.includes('start') }
                        isChecked={ stepChecks.includes('perform') }
                        hasAppend={ true }
                        onPress={ () => this.handleLaneChangeRadioPressed('perform') }
                        label='超车' />
                </View>
            </View>
        )
    }

    renderLaneChangeStepPointStart() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Entrance>
                    <X.Button
                        size='small' color='ghost' textWeight='light'
                        style={ Styles.onboardingStepPointCrumb }
                        onPress={ () => this.handleLaneChangeRadioPressed('index') }>
                        控制
                    </X.Button>
                    <X.Text size='medium' color='white' weight='bold'>
                        切换车道
                    </X.Text>
                    <X.Text
                        size='small' color='white' weight='light'
                        style={ Styles.onboardingStepContextSmaller }>
                        {/* With openpilot engaged, turn on your signal, check
                        your surroundings, and confirm it is safe to change lanes. */}
                        自动驾驶激活后，您可以通过朝对应的方向打转向灯，来发出切换车道的指令。
                    </X.Text>
                    <X.Button color='ghost'
                        style={ Styles.onboardingStepPointInstruction }
                        onPress={ () => this.handleWrongGatePressed() }>
                        <X.Text
                            size='small' color='white' weight='semibold'
                            style={ Styles.onboardingStepPointInstructionText }>
                            {/* Select turn signal */}
                            点击转向拨杆
                        </X.Text>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointInstructionIcon } />
                    </X.Button>
                </X.Entrance>
            </X.Entrance>
        )
    }

    renderLaneChangeStepPointPerform() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Entrance>
                    <X.Button
                        size='small' color='ghost' textWeight='light'
                        style={ Styles.onboardingStepPointCrumb }
                        onPress={ () => this.handleLaneChangeRadioPressed('index') }>
                        {/* we lane changes */}
                        切换车道
                    </X.Button>
                    <X.Text size='medium' color='white' weight='bold'>
                        {/* Perform Lane Change */}
                        切换车道
                    </X.Text>
                    <X.Text
                        size='small' color='white' weight='light'
                        style={ Styles.onboardingStepContextSmaller }>
                            在打转向灯，确认路况安全以后，朝想要切换车道的方向微打一下方向盘后，wepilot将执行切换车道的工作。
                            因为传感器的限制，wepilot无法检测测后方的车辆，请您务必确认安全后再切换车道！！！
                        {/* Continuously observe your surroundings for safety while
                        gently nudging the steering wheel towards your desired
                        lane. The combination of turn signal and wheel nudge
                        will prompt wepilot to change lanes. */}
                    </X.Text>
                    <X.Button color='ghost'
                        style={ Styles.onboardingStepPointInstruction }
                        onPress={ () => this.handleWrongGatePressed() }>
                        <X.Text
                            size='small' color='white' weight='semibold'
                            style={ Styles.onboardingStepPointInstructionText }>
                            {/* Select steering wheel */}
                            点击方向盘
                        </X.Text>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointInstructionIcon } />
                    </X.Button>
                </X.Entrance>
            </X.Entrance>
        )
    }

    renderDisengagingStepPointIndex() {
        const { stepChecks } = this.state;
        return (
            <View style={ Styles.onboardingStepPoint }>
                <View style={ Styles.onboardingStepPointChain }>
                    <X.Button
                        size='small' color='ghost'
                        style={ Styles.onboardingStepPointChainPrevious }
                        onPress={ () => this.setStep('OB_LANECHANGE') }>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointChainPreviousIcon } />
                    </X.Button>
                    <View style={ Styles.onboardingStepPointChainNumber }>
                        <X.Text color='white' weight='semibold'>
                            5
                        </X.Text>
                    </View>
                </View>
                <View style={ Styles.onboardingStepPointBody }>
                    <X.Text size='bigger' color='white' weight='bold'>
                        踩任意踏板退出自动驾驶
                        {/* openpilot will stop driving when a pedal is pressed. */}
                    </X.Text>
                    <X.Text
                        size='smallish' color='white' weight='light'
                        style={ Styles.onboardingStepContextSmall }>
                        自动驾驶过程中，您可以通过踩刹车或油门踏板，随时中断自动驾驶并接管控制。    
                        {/* When encountering a potentially unsafe situation or
                        exiting a highway, you can disengage with any pedal. */}
                    </X.Text>
                    <X.RadioField
                        size='big'
                        color='white'
                        isChecked={ stepChecks.includes('limitations') }
                        hasAppend={ true }
                        onPress={ () => this.handleDisengageRadioPressed('limitations') }
                        label='受限制的功能' />
                    <X.RadioField
                        size='big'
                        color='white'
                        isDisabled={ !stepChecks.includes('limitations') }
                        isChecked={ stepChecks.includes('disengage') }
                        hasAppend={ true }
                        onPress={ () => this.handleDisengageRadioPressed('disengage') }
                        label='切换车道' />
                </View>
            </View>
        )
    }

    renderDisengagingStepPointLimitations() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Entrance>
                    <X.Button
                        size='small' color='ghost' textWeight='light'
                        style={ Styles.onboardingStepPointCrumb }
                        onPress={ () => this.handleDisengageRadioPressed('index') }>
                        {/* wepilot disengaging */}
                        wepilot的限制
                    </X.Button>
                    <X.Text size='medium' color='white' weight='bold'>
                        {/* Limited Features */}
                        wepilot无法识别以下场景
                    </X.Text>
                    <X.Text
                        size='small' color='white' weight='light'
                        style={ Styles.onboardingStepContextSmaller }>
                        wepilot并不能识别所有路况，比如无法识别红绿灯，人行横刀线，交通标志，以及从其他车道近距离快速切入的车辆。
                        您必须时刻关注路况，并在这些情况出现时，取消自动驾驶，自己接管。
                        {/* Keep in mind that certain situations are not handled by
                        wepilot. Scenarios such as traffic lights, stop signs,
                        quick vehicle cutins and pedestrians are unrecognized
                        and wepilot may accelerate. */}
                    </X.Text>
                    <X.Button color='ghost'
                        style={ Styles.onboardingStepPointInstruction }
                        onPress={ () => this.handleWrongGatePressed() }>
                        <X.Text
                            size='small' color='white' weight='semibold'
                            style={ Styles.onboardingStepPointInstructionText }>
                            {/* Select light to continue */}
                            点击红绿灯
                        </X.Text>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointInstructionIcon } />
                    </X.Button>
                </X.Entrance>
            </X.Entrance>
        )
    }

    renderDisengagingStepPointDisengage() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Entrance>
                    <X.Button
                        size='small' color='ghost' textWeight='light'
                        style={ Styles.onboardingStepPointCrumb }
                        onPress={ () => this.handleDisengageRadioPressed('index') }>
                        {/* openpilot disengaging */}
                        取消wepilot
                    </X.Button>
                    <X.Text size='medium' color='white' weight='bold'>
                        {/* Disengage wepilot */}
                        取消自动驾驶
                    </X.Text>
                    <X.Text
                        size='small' color='white' weight='light'
                        style={ Styles.onboardingStepContextSmaller }>
                        {/* While wepilot is engaged, you may keep your hands
                        on the wheel to override lateral controls. Longitudinal
                        controls will be managed by wepilot until the gas
                        or brake pedal is pressed to disengage. */}
                        自动驾驶激活后，您随时可以自己操纵方向盘来改变方向。此时油门和刹车仍由自动驾驶
                        系统控制，踩下刹车或油门踏板，可以取消自动驾驶。
                    </X.Text>
                    <X.Button color='ghost'
                        style={ Styles.onboardingStepPointInstruction }
                        onPress={ () => this.handleWrongGatePressed() }>
                        <X.Text
                            size='small' color='white' weight='semibold'
                            style={ Styles.onboardingStepPointInstructionText }>
                            {/* Tap a pedal to disengage */}
                            点击踏板
                        </X.Text>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointInstructionIcon } />
                    </X.Button>
                </X.Entrance>
            </X.Entrance>
        )
    }

    renderEngagingStep() {
        return (
            <X.Entrance style={ Styles.onboardingStep }>
                { this.renderEngagingStepPoint() }
            </X.Entrance>
        )
    }

    renderLaneChangeStep() {
        return (
            <X.Entrance style={ Styles.onboardingStep }>
                { this.renderLaneChangeStepPoint() }
            </X.Entrance>
        )
    }

    renderDisengagingStep() {
        return (
            <X.Entrance style={ Styles.onboardingStep }>
                { this.renderDisengagingStepPoint() }
            </X.Entrance>
        )
    }

    renderOutroStep() {
        return (
            <X.Entrance style={ Styles.onboardingOutroView }>
                <X.Text
                    size='jumbo' color='white' weight='bold'
                    style={ Styles.onboardingStepHeader }>
                    {/* Congratulations! You have completed wepilot training. */}
                    教程结束
                </X.Text>
                <X.Text
                    color='white' weight='light'
                    style={ Styles.onboardingStepContextSmaller }>
                    {/* This guide can be replayed at any time from the
                    device settings. To learn more about wepilot, read the
                    wiki and join the community at discord.comma.ai */}
                    您可以随时再次观看本教程。
                </X.Text>
                <X.Line color='transparent' spacing='small' />
                <View style={ Styles.onboardingActionsRow }>
                    <View style={ Styles.onboardingPrimaryAction }>
                        <X.Button
                            color='setupPrimary'
                            onPress={ this.props.completeTrainingStep }>
                            {/* Finish Training */}
                            结束教程
                        </X.Button>
                    </View>
                    <View style={ Styles.onboardingSecondaryAction }>
                        <X.Button
                            color='setupInverted'
                            textColor='white'
                            onPress={ this.handleRestartPressed }>
                            {/* Restart */}
                            重新观看教程
                        </X.Button>
                    </View>
                </View>
            </X.Entrance>
        )
    }

    renderSensorsStepPoint() {
        const { stepPoint } = this.state;
        switch (stepPoint) {
            case 0:
                return this.renderSensorsStepPointIndex(); break;
            case 1:
                return this.renderSensorsStepPointCamera(); break;
            case 2:
                return this.renderSensorsStepPointRadar(); break;
        }
    }

    renderEngagingStepPoint() {
        const { stepPoint } = this.state;
        switch (stepPoint) {
            case 0:
                return this.renderEngagingStepPointIndex(); break;
            case 1:
                return this.renderEngagingStepPointEngage(); break;
            case 2:
                return this.renderEngagingStepPointMonitoring(); break;
        }
    }

    renderLaneChangeStepPoint() {
        const { stepPoint } = this.state;
        switch (stepPoint) {
            case 0:
                return this.renderLaneChangeStepPointIndex(); break;
            case 1:
                return this.renderLaneChangeStepPointStart(); break;
            case 2:
                return this.renderLaneChangeStepPointPerform(); break;
        }
    }

    renderDisengagingStepPoint() {
        const { stepPoint } = this.state;
        switch (stepPoint) {
            case 0:
                return this.renderDisengagingStepPointIndex(); break;
            case 1:
                return this.renderDisengagingStepPointLimitations(); break;
            case 2:
                return this.renderDisengagingStepPointDisengage(); break;
        }
    }

    renderStep() {
        const { step } = this.state;
        switch (step) {
            case Step.OB_SPLASH:
                return this.renderSplashStep(); break;
            case Step.OB_INTRO:
                return this.renderIntroStep(); break;
            case Step.OB_SENSORS:
                return this.renderSensorsStep(); break;
            case Step.OB_ENGAGE:
                return this.renderEngagingStep(); break;
            case Step.OB_LANECHANGE:
                return this.renderLaneChangeStep(); break;
            case Step.OB_DISENGAGE:
                return this.renderDisengagingStep(); break;
            case Step.OB_OUTRO:
                return this.renderOutroStep(); break;
        }
    }

    render() {
        const {
            step,
            stepPoint,
            stepChecks,
            photoOffset,
            photoCycled,
            photoCycledLast,
            leadEntered,
            engagedMocked,
            gateHighlighted,
        } = this.state;

        const overlayStyle = [
            Styles.onboardingOverlay,
            stepPoint > 0 ? Styles.onboardingOverlayCollapsed : null,
        ];

        const gradientColor = engagedMocked ? 'engaged_green' : 'dark_blue';

        const Animations = {
            leadIndicatorDescended: {
                transform: [{
                    translateY: photoCycled.interpolate({
                        inputRange: [0, 100],
                        outputRange: [0, 40]
                    })
                }, {
                    translateX: photoCycled.interpolate({
                        inputRange: [0, 100],
                        outputRange: [0, -10]
                    })
                }, {
                    scaleX: photoCycled.interpolate({
                        inputRange: [0, 100],
                        outputRange: [1, 1.5]
                    })
                }, {
                    scaleY: photoCycled.interpolate({
                        inputRange: [0, 100],
                        outputRange: [1, 1.5]
                    })
                }]
            },
        };

        return (
            <View style={ Styles.onboardingContainer }>
                <Animated.Image
                    source={ require('../../../img/photo_baybridge_a_01.jpg') }
                    style={ [Styles.onboardingPhoto, {
                        transform: [{
                            translateX: photoOffset.interpolate({
                                inputRange: [0, 100],
                                outputRange: [0, -50]
                            })
                        }],
                    }] }>
                </Animated.Image>
                <Animated.Image
                    source={ require('../../../img/illustration_training_lane_01.png') }
                    style={ [Styles.onboardingVisualLane, {
                        transform: [{
                            translateX: photoOffset.interpolate({
                                inputRange: [0, 100],
                                outputRange: [50, 0]
                            })
                        }],
                        opacity: photoOffset.interpolate({
                            inputRange: [0, 100],
                            outputRange: [0, 1],
                        })
                    }] } />

                <View style={[{ flexDirection: 'row',
        justifyContent: 'center', position: 'absolute' }, Styles.onboardingVisualLane]}>
                    <Animated.Image
                        source={ require('../../../img/illustration_training_lane_01.png') }
                        tintColor='lime'
                        pointerEvents='none'
                        style={ [Styles.absoluteFill, {
                            opacity: gateHighlighted.interpolate({
                                inputRange: [0, 100],
                                outputRange: [0, 1],
                            })
                        }] } />
                    { stepPoint == 1 ? (
                        <View style={ Styles.onboardingVisualLaneTouchGate }>
                            <X.Button
                                onPress={ () => { this.handleSensorVisualPressed('camera') } }
                                style={ Styles.onboardingVisualLaneTouchGateButton } />
                        </View>
                    ) : null }
                </View>

                { (step === 'OB_SENSORS' && stepPoint > 1) ? (
                    <View style={ Styles.onboardingVisuals }>
                        <Animated.Image
                            source={ require('../../../img/photo_baybridge_b_01.jpg') }
                            style={ [Styles.onboardingPhotoCycled, {
                                opacity: photoCycled.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: [0, 1],
                                })
                            }] } />
                        <Animated.Image
                            source={ require('../../../img/illustration_training_lane_02.png') }
                            style={ [Styles.onboardingVisualLaneZoomed, {
                                opacity: photoCycled.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: [0, 1],
                                })
                            }] }>
                        </Animated.Image>
                        <Animated.Image
                            source={ require('../../../img/illustration_training_lead_01.png') }
                            style={ [Styles.onboardingVisualLead,
                                Animations.leadIndicatorDescended ] } />
                        <Animated.Image
                            source={ require('../../../img/illustration_training_lead_02.png') }
                            style={ [Styles.onboardingVisualLead,
                                Styles.onboardingVisualLeadZoomed,
                                Animations.leadIndicatorDescended, {
                                opacity: photoCycled.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: [0, 1]
                                }),
                            }] } />
                        <Animated.View
                            style={ [Styles.onboardingVisualLeadTouchGate,
                                Animations.leadIndicatorDescended, {
                                  opacity: gateHighlighted.interpolate({
                                      inputRange: [0, 100],
                                      outputRange: [0, 1],
                                  }),
                                }] }>
                            <X.Button
                                style={ Styles.onboardingVisualLeadTouchGateButton }
                                onPress={ () => { this.handleSensorVisualPressed('radar') } } />
                        </Animated.View>
                    </View>
                ) : null }

                { step === 'OB_ENGAGE' ? (
                    <View style={ Styles.onboardingVisuals }>
                        <Animated.Image
                            source={ require('../../../img/photo_wheel_buttons_01.jpg') }
                            style={ [Styles.onboardingPhotoCruise] } />
                        { stepPoint == 1 ? (
                            <Animated.View
                              style={ [Styles.onboardingVisualCruiseTouchContainer, {
                                opacity: gateHighlighted.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: [0, 1],
                                }),
                              }] }>
                                <X.Button
                                    style={ Styles.onboardingVisualCruiseTouchGateButton }
                                    onPress={ () => { this.handleEngageVisualPressed('cruise') } } />
                            </Animated.View>
                        ) : null }
                        { stepPoint == 2 ? (
                            <React.Fragment>
                                <Animated.Image
                                    source={ require('../../../img/photo_monitoring_01.jpg') }
                                    style={ [Styles.onboardingPhotoCycled, Styles.onboardingFaceImage, {
                                        opacity: photoCycled.interpolate({
                                            inputRange: [0, 100],
                                            outputRange: [0, 1],
                                        }),
                                    }] }>
                                </Animated.Image>
                                <Animated.View style={ [Styles.onboardingFaceTouchGate, {
                                  opacity: gateHighlighted.interpolate({
                                      inputRange: [0, 100],
                                      outputRange: [0, 1],
                                  }),
                                }]}>
                                    <X.Button
                                        style={ Styles.onboardingTouchGateButton }
                                        onPress={ () => { this.handleEngageVisualPressed('monitoring') } } />
                                </Animated.View>
                            </React.Fragment>
                        ) : null }
                    </View>
                ) : null }

                { step === 'OB_LANECHANGE' ? (
                    <View style={ Styles.onboardingVisuals }>
                        <Animated.Image
                            source={ require('../../../img/photo_turn_signal_02.jpg') }
                            style={ [Styles.onboardingPhotoSignal] } />
                        { stepPoint == 1 ? (
                            <Animated.View style={ [Styles.onboardingSignalTouchGate, {
                              opacity: gateHighlighted.interpolate({
                                  inputRange: [0, 100],
                                  outputRange: [0, 1],
                              }),
                            }]}>
                                <X.Button
                                    style={ Styles.onboardingTouchGateButton }
                                    onPress={ () => { this.handleLaneChangeVisualPressed('start') } } />
                            </Animated.View>
                        ) : null }
                        { stepPoint == 2 ? (
                            <React.Fragment>
                                <Animated.Image
                                    source={ require('../../../img/photo_wheel_hands_01.jpg') }
                                    style={ [Styles.onboardingPhotoCycled, {
                                        opacity: photoCycled.interpolate({
                                            inputRange: [0, 100],
                                            outputRange: [0, 1],
                                        }),
                                    }] }>
                                </Animated.Image>
                                <Animated.View style={ [Styles.onboardingWheelTouchGate, {
                                  opacity: gateHighlighted.interpolate({
                                      inputRange: [0, 100],
                                      outputRange: [0, 1],
                                  }),
                                }]}>
                                    <X.Button
                                        style={ Styles.onboardingTouchGateButton }
                                        onPress={ () => { this.handleLaneChangeVisualPressed('perform') } } />
                                </Animated.View>
                            </React.Fragment>
                        ) : null }
                    </View>
                ) : null }

                { step === 'OB_DISENGAGE' ? (
                    <View style={ Styles.onboardingVisuals }>
                        <Animated.Image
                            source={ require('../../../img/photo_traffic_light_01.jpg') }
                            style={ [Styles.onboardingPhotoCruise] } />
                        { stepPoint == 1 ? (
                            <Animated.View style={ [Styles.onboardingLightTouchGate, {
                                opacity: gateHighlighted.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: [0, 1],
                                }),
                            }]}>
                                <X.Button
                                    style={ Styles.onboardingTouchGateButton }
                                    onPress={ () => { this.handleDisengageVisualPressed('limitations') } } />
                            </Animated.View>
                        ) : null }
                        { stepPoint == 2 ? (
                            <View style={ Styles.onboardingVisuals }>
                                <Animated.Image
                                    source={ require('../../../img/photo_pedals_01.jpg') }
                                    style={ [Styles.onboardingPhotoCycled, Styles.onboardingPhotoPedals, {
                                        opacity: photoCycledLast.interpolate({
                                            inputRange: [0, 100],
                                            outputRange: [0, 1],
                                        }),
                                    }] } />
                                <Animated.View style={ [Styles.onboardingBrakePedalTouchGate, {
                                  opacity: gateHighlighted.interpolate({
                                      inputRange: [0, 100],
                                      outputRange: [0, 1],
                                  }),
                                }]}>
                                    <X.Button
                                        style={ Styles.onboardingTouchGateButton }
                                        onPress={ () => { this.handleDisengageVisualPressed('disengage') } } />
                                </Animated.View>
                                <Animated.View style={ [Styles.onboardingGasPedalTouchGate, {
                                  opacity: gateHighlighted.interpolate({
                                      inputRange: [0, 100],
                                      outputRange: [0, 1],
                                  }),
                                }] }>
                                    <X.Button
                                        style={ Styles.onboardingTouchGateButton }
                                        onPress={ () => { this.handleDisengageVisualPressed('disengage') } } />
                                </Animated.View>
                            </View>
                        ) : null }
                    </View>
                ) : null }

                <Animated.View
                    style={ overlayStyle }>
                    <X.Gradient
                        color={ gradientColor }>
                        { this.renderStep() }
                    </X.Gradient>
                </Animated.View>
            </View>
        )
    }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
    completeTrainingStep: completeTrainingStep('Onboarding', dispatch),
    restartTraining: () => {
        onTrainingRouteCompleted('Onboarding');
    },
    onSidebarCollapsed: () => {
        ChffrPlus.sendBroadcast("ai.comma.plus.frame.ACTION_SIDEBAR_COLLAPSED");
    },
    onSidebarExpanded: () => {
        ChffrPlus.sendBroadcast("ai.comma.plus.frame.ACTION_SIDEBAR_EXPANDED");
    },
});
export default connect(mapStateToProps, mapDispatchToProps)(Onboarding);
