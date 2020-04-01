import React, { Component } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    TextInput,
    View,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';

import ChffrPlus from '../../native/ChffrPlus';
import UploadProgressTimer from '../../timers/UploadProgressTimer';
import { formatSize } from '../../utils/bytes';
import { mpsToKph, mpsToMph, kphToMps, mphToMps } from '../../utils/conversions';
import { Params } from '../../config';
import { resetToLaunch } from '../../store/nav/actions';

import {
    updateSshEnabled,
    updateSidebarCollapsed,
} from '../../store/host/actions';
import {
    deleteParam,
    updateParam,
    refreshParams,
} from '../../store/params/actions';

import X from '../../themes';
import Styles from './SettingsStyles';

const SettingsRoutes = {
    PRIMARY: 'PRIMARY',
    ACCOUNT: 'ACCOUNT',
    DEVICE: 'DEVICE',
    NETWORK: 'NETWORK',
    DEVELOPER: 'DEVELOPER',
}

const Icons = {
    user: require('../../img/icon_user.png'),
    developer: require('../../img/icon_shell.png'),
    warning: require('../../img/icon_warning.png'),
    monitoring: require('../../img/icon_monitoring.png'),
    metric: require('../../img/icon_metric.png'),
    network: require('../../img/icon_network.png'),
    eon: require('../../img/icon_eon.png'),
    calibration: require('../../img/icon_calibration.png'),
    speedLimit: require('../../img/icon_speed_limit.png'),
    plus: require('../../img/icon_plus.png'),
    minus: require('../../img/icon_minus.png'),
    mapSpeed: require('../../img/icon_map.png'),
    openpilot: require('../../img/icon_openpilot.png'),
}

class Settings extends Component {
    static navigationOptions = {
        header: null,
    }

    constructor(props) {
        super(props);

        this.state = {
            route: SettingsRoutes.PRIMARY,
            expandedCell: null,
            version: {
                versionString: '',
                gitBranch: null,
                gitRevision: null,
            },
            speedLimitOffsetInt: '0',
            githubUsername: '',
            authKeysUpdateState: null,
        }

        this.writeSshKeys = this.writeSshKeys.bind(this);
        this.toggleExpandGithubInput = this.toggleExpandGithubInput.bind(this);
    }

    async componentWillMount() {
        UploadProgressTimer.start(this.props.dispatch);
        await this.props.refreshParams();
        const {
            isMetric,
            params: {
                SpeedLimitOffset: speedLimitOffset
            },
        } = this.props;

        if (isMetric) {
            this.setState({ speedLimitOffsetInt: parseInt(mpsToKph(speedLimitOffset)) })
        } else {
            this.setState({ speedLimitOffsetInt: parseInt(mpsToMph(speedLimitOffset)) })
        }
    }

    async componentWillUnmount() {
        await this.props.handleSidebarExpanded();
        await ChffrPlus.emitSidebarExpanded();
        UploadProgressTimer.stop();
    }

    handleExpanded(key) {
        const { expandedCell } = this.state;
        return this.setState({
            expandedCell: expandedCell == key ? null : key,
        })
    }

    handlePressedBack() {
        const { route } = this.state;
        this.props.handleSidebarExpanded();
        if (route == SettingsRoutes.PRIMARY) {
            ChffrPlus.sendBroadcast("ai.comma.plus.offroad.NAVIGATED_FROM_SETTINGS");
            this.props.navigateHome();
        } else {
            this.handleNavigatedFromMenu(SettingsRoutes.PRIMARY);
        }
    }

    handleNavigatedFromMenu(route) {
        this.setState({ route: route })
        this.refs.settingsScrollView.scrollTo({ x: 0, y: 0, animated: false })
        this.props.refreshParams();
    }

    handlePressedResetCalibration = async () => {
        this.props.deleteParam(Params.KEY_CALIBRATION_PARAMS);
        this.setState({ calibration: null });
        Alert.alert('Reboot', 'Resetting calibration requires a reboot.', [
            { text: 'Later', onPress: () => { }, style: 'cancel' },
            { text: 'Reboot Now', onPress: () => ChffrPlus.reboot() },
        ]);
    }

    // handleChangedSpeedLimitOffset(operator) {
    //     const { speedLimitOffset, isMetric } = this.props;
    //     let _speedLimitOffset;
    //     let _speedLimitOffsetInt;
    //     switch (operator) {
    //       case 'increment':
    //           if (isMetric) {
    //               _speedLimitOffset = kphToMps(Math.max(Math.min(speedLimitOffsetInt + 1, 25), -15));
    //               _speedLimitOffsetInt = Math.round(mpsToKph(_speedLimitOffset));
    //           } else {
    //               _speedLimitOffset = mphToMps(Math.max(Math.min(speedLimitOffsetInt + 1, 15), -10));
    //               _speedLimitOffsetInt = Math.round(mpsToMph(_speedLimitOffset));
    //           }
    //           break;
    //       case 'decrement':
    //           if (isMetric) {
    //               _speedLimitOffset = kphToMps(Math.max(Math.min(speedLimitOffsetInt - 1, 25), -15));
    //               _speedLimitOffsetInt = Math.round(mpsToKph(_speedLimitOffset));
    //           } else {
    //               _speedLimitOffset = mphToMps(Math.max(Math.min(speedLimitOffsetInt - 1, 15), -10));
    //               _speedLimitOffsetInt = Math.round(mpsToMph(_speedLimitOffset));
    //           }
    //           break;
    //     }
    //     this.setState({ speedLimitOffsetInt: _speedLimitOffsetInt });
    //     this.props.setSpeedLimitOffset(_speedLimitOffset);
    // }

    // handleChangedIsMetric() {
    //     const { isMetric, speedLimitOffset } = this.props;
    //     const { speedLimitOffsetInt } = this.state;
    //     if (isMetric) {
    //         this.setState({ speedLimitOffsetInt: parseInt(mpsToMph(speedLimitOffset)) })
    //         this.props.setMetric(false);
    //     } else {
    //         this.setState({ speedLimitOffsetInt: parseInt(mpsToKph(speedLimitOffset)) })
    //         this.props.setMetric(true);
    //     }
    // }

    renderSettingsMenu() {
        const {
            isPaired,
            wifiState,
            simState,
            freeSpace,
            params: {
                Passive: isPassive,
                Version: version,
            },
        } = this.props;
        const software = !!parseInt(isPassive) ? 'chffrplus' : 'wepilot';
        let connectivity = 'Disconnected'
        if (wifiState.isConnected && wifiState.ssid) {
            connectivity = wifiState.ssid;
        } else if (simState.networkType && simState.networkType != 'NO SIM') {
            connectivity = simState.networkType;
        }
        const settingsMenuItems = [
            // {
            //     icon: Icons.user,
            //     title: 'Account',
            //     context: isPaired ? 'Paired' : 'Unpaired',
            //     route: SettingsRoutes.ACCOUNT,
            // },
            {
                icon: Icons.eon,
                title: '设备',
                context: `${parseInt(freeSpace) + '%'} Free`,
                route: SettingsRoutes.DEVICE,
            },
            {
                icon: Icons.network,
                title: '网络',
                context: connectivity,
                route: SettingsRoutes.NETWORK,
            },
            {
                icon: Icons.developer,
                title: '开发调试',
                // context: `${software} v${version.split('-')[0]}`,
                context: 'dean',
                route: SettingsRoutes.DEVELOPER,
            },
        ];
        return settingsMenuItems.map((item, idx) => {
            const cellButtonStyle = [
                Styles.settingsMenuItem,
                idx == 3 ? Styles.settingsMenuItemBorderless : null,
            ]
            return (
                <View key={idx} style={cellButtonStyle}>
                    <X.Button
                        color='transparent'
                        size='full'
                        style={Styles.settingsMenuItemButton}
                        onPress={() => this.handleNavigatedFromMenu(item.route)}>
                        <X.Image
                            source={item.icon}
                            style={Styles.settingsMenuItemIcon} />
                        <X.Text
                            color='white'
                            size='small'
                            weight='semibold'
                            style={Styles.settingsMenuItemTitle}>
                            {item.title}
                        </X.Text>
                        <X.Text
                            color='white'
                            size='tiny'
                            weight='light'
                            style={Styles.settingsMenuItemContext}>
                            {item.context}
                        </X.Text>
                    </X.Button>
                </View>
            )
        })
    }

    renderPrimarySettings() {
        const {
            params: {
                RecordFront: recordFront,
                IsMetric: isMetric,
                LongitudinalControl: hasLongitudinalControl,
                LimitSetSpeed: limitSetSpeed,
                SpeedLimitOffset: speedLimitOffset,
                OpenpilotEnabledToggle: openpilotEnabled,
                Passive: isPassive,
                IsLdwEnabled: isLaneDepartureWarningEnabled,
                IsDriverMonitorEnabled: isDMEnabled,
                LaneChangeEnabled: laneChangeEnabled,
            }
        } = this.props;
        const { expandedCell, speedLimitOffsetInt } = this.state;
        return (
            <View style={Styles.settings}>
                <View style={Styles.settingsHeader}>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={() => this.handlePressedBack()}>
                        {'<  设置'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={Styles.settingsWindow}>
                    <X.Table direction='row' color='darkBlue'>
                        {this.renderSettingsMenu()}
                    </X.Table>
                    <X.Table color='darkBlue'>
                        {/* {!parseInt(isPassive) ? (
                            <X.TableCell
                                type='switch'
                                title='自动驾驶'
                                value={!!parseInt(openpilotEnabled)}
                                iconSource={Icons.openpilot}
                                // description='Use the wepilot system for adaptive cruise control and lane keep driver assistance. Your attention is required at all times to use this feature. Changing this setting takes effect when the car is powered off.'
                                description='使用wepilot为您自动驾驶车辆. 您需要时刻关注路况.该设置在车辆熄火时有效。'
                                isExpanded={expandedCell == 'openpilot_enabled'}
                                handleExpanded={() => this.handleExpanded('openpilot_enabled')}
                                handleChanged={this.props.setOpenpilotEnabled} />
                        ) : null} */}
                        {/* { !parseInt(isPassive) ? (
                            <X.TableCell
                                type='switch'
                                title='允许自动换道'
                                value={ !!parseInt(laneChangeEnabled) }
                                iconSource={ Icons.openpilot }
                                // description='Perform assisted lane changes with openpilot by checking your surroundings for safety, activating the turn signal and gently nudging the steering wheel towards your desired lane. openpilot is not capable of checking if a lane change is safe. You must continuously observe your surroundings to use this feature.'
                                description='允许换道协助, 打开转向灯朝要切换车道的方向微打方向盘。驾驶员必须自己确保换道是安全的'
                                isExpanded={ expandedCell == 'lanechange_enabled' }
                                handleExpanded={ () => this.handleExpanded('lanechange_enabled') }
                                handleChanged={ this.props.setLaneChangeEnabled } />
                        ) : null } */}
                        {/* <X.TableCell
                            type='switch'
                            title='车道偏离警告'
                            value={!!parseInt(isLaneDepartureWarningEnabled)}
                            iconSource={Icons.warning}
                            // description='Receive alerts to steer back into the lane when your vehicle drifts over a detected lane line without a turn signal activated while driving over 31mph (50kph).'
                            description='车速超过50公里后，如果车辆偏离车道，将发出报警.'
                            isExpanded={expandedCell == 'ldw'}
                            handleExpanded={() => this.handleExpanded('ldw')}
                            handleChanged={this.props.setLaneDepartureWarningEnabled} /> */}
                        <X.TableCell
                            type='switch'
                            title='驾驶员监控'
                            value={!!parseInt(isDMEnabled)}
                            iconSource={Icons.monitoring}
                            description='驾驶员监控通过三维人脸重建和姿态估计来检测驾驶员的感知。当驾驶员出现分心时，它会发出警告。这一功能仍处于测试阶段，所以当面部跟踪太不准确时(比如在晚上)，驾驶员监控是不可用的。可用性由左下角的face图标指示。'
                            isExpanded={expandedCell == 'driver_monitoring'}
                            handleExpanded={() => this.handleExpanded('driver_monitoring')}
                            handleChanged={this.props.setDriverMonitoringEnabled} />
                        <X.TableCell
                            type='switch'
                            // title='Record and Upload Driver Camera'
                            title='上传驾驶员监控数据'
                            value={!!parseInt(recordFront)}
                            iconSource={Icons.network}
                            description='上传驾驶员监控.'
                            // description='Upload data from the driver facing camera and help improve the Driver Monitoring algorithm.'
                            isExpanded={expandedCell == 'record_front'}
                            handleExpanded={() => this.handleExpanded('record_front')}
                            handleChanged={this.props.setRecordFront} />
                        {/* * <X.TableCell
                            type='switch'
                            title='Use Metric System'
                            value={ !!parseInt(isMetric) }
                            iconSource={ Icons.metric }
                            description='Display speed in km/h instead of mp/h.'
                            isExpanded={ expandedCell == 'metric' }
                            handleExpanded={ () => this.handleExpanded('metric') }
                            handleChanged={ this.props.setMetric } /> */}
                    </X.Table>
                    {/*
                      <X.Table color='darkBlue'>
                        <X.TableCell
                            type='custom'
                            title='Add Speed Limit Offset'
                            iconSource={ Icons.speedLimit }
                            description='Customize the default speed limit warning with an offset in km/h or mph above the posted legal limit when available.'
                            isExpanded={ expandedCell == 'speedLimitOffset' }
                            handleExpanded={ () => this.handleExpanded('speedLimitOffset') }
                            handleChanged={ this.props.setLimitSetSpeed }>
                            <X.Button
                                color='ghost'
                                activeOpacity={ 1 }
                                style={ Styles.settingsSpeedLimitOffset }>
                                <X.Button
                                    style={ [Styles.settingsNumericButton, { opacity: speedLimitOffsetInt == (isMetric ? -15 : -10) ? 0.1 : 0.8 }] }
                                    onPress={ () => this.handleChangedSpeedLimitOffset('decrement')  }>
                                    <X.Image
                                        source={ Icons.minus }
                                        style={ Styles.settingsNumericIcon } />
                                </X.Button>
                                <X.Text
                                    color='white'
                                    weight='semibold'
                                    style={ Styles.settingsNumericValue }>
                                    { speedLimitOffsetInt }
                                </X.Text>
                                <X.Button
                                    style={ [Styles.settingsNumericButton, { opacity: speedLimitOffsetInt == (isMetric ? 25 : 15) ? 0.1 : 0.8 }] }
                                    onPress={ () => this.handleChangedSpeedLimitOffset('increment') }>
                                    <X.Image
                                        source={ Icons.plus }
                                        style={ Styles.settingsNumericIcon } />
                                </X.Button>
                            </X.Button>
                        </X.TableCell>
                        <X.TableCell
                            type='switch'
                            title='Use Map To Control Vehicle Speed'
                            value={ !!parseInt(limitSetSpeed) }
                            isDisabled={ !parseInt(hasLongitudinalControl) }
                            iconSource={ Icons.mapSpeed }
                            description='Use map data to control the vehicle speed. A curvy road icon appears when the car automatically slows down for upcoming turns. The vehicle speed is also limited by the posted legal limit, when available, including the custom offset. This feature is only available for cars where openpilot manages longitudinal control and when EON has internet connectivity. The map icon appears when map data are downloaded.'
                            isExpanded={ expandedCell == 'limitSetSpeed' }
                            handleExpanded={ () => this.handleExpanded('limitSetSpeed') }
                            handleChanged={ this.props.setLimitSetSpeed } />
                    </X.Table>
                    */}
                    <X.Table color='darkBlue'>
                        <X.Button
                            color='settingsDefault'
                            onPress={() => this.props.openTrainingGuide()}>
                            阅读说明
                        </X.Button>
                    </X.Table>
                </ScrollView>
            </View>
        )
    }

    renderAccountSettings() {
        const { isPaired } = this.props;
        const { expandedCell } = this.state;
        return (
            <View style={Styles.settings}>
                <View style={Styles.settingsHeader}>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={() => this.handlePressedBack()}>
                        {'<  Account Settings'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={Styles.settingsWindow}>
                    <View>
                        <X.Table>
                            <X.TableCell
                                title='Device Paired'
                                value={isPaired ? 'Yes' : 'No'} />
                            {isPaired ? (
                                <X.Text
                                    color='white'
                                    size='tiny'>
                                    You may unpair your device in the comma connect app settings.
                                </X.Text>
                            ) : null}
                            <X.Line color='light' />
                            <X.Text
                                color='white'
                                size='tiny'>
                                Terms of Service available at {'https://my.comma.ai/terms.html'}
                            </X.Text>
                        </X.Table>
                        {isPaired ? null : (
                            <X.Table color='darkBlue' padding='big'>
                                <X.Button
                                    color='settingsDefault'
                                    size='small'
                                    onPress={this.props.openPairing}>
                                    Pair Device
                                </X.Button>
                            </X.Table>
                        )}
                    </View>
                </ScrollView>
            </View>
        )
    }

    renderDeviceSettings() {
        const {
            expandedCell,
        } = this.state;

        const {
            serialNumber,
            txSpeedKbps,
            freeSpace,
            isPaired,
            params: {
                DongleId: dongleId,
                Passive: isPassive,
            },
        } = this.props;
        const software = !!parseInt(isPassive) ? 'chffrplus' : 'wepilot';
        return (
            <View style={Styles.settings}>
                <View style={Styles.settingsHeader}>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={() => this.handlePressedBack()}>
                        {'<  设备设置'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={Styles.settingsWindow}>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='custom'
                            title='摄像头校准'
                            iconSource={Icons.calibration}
                            // description='The calibration algorithm is always active on the road facing camera. Resetting calibration is only advised when the device reports an invalid calibration alert or when the device is remounted in a different position.'
                            description='提示需要重新校准时再使用该功能.'
                            isExpanded={expandedCell == 'calibration'}
                            handleExpanded={() => this.handleExpanded('calibration')}>
                            <X.Button
                                size='tiny'
                                color='settingsDefault'
                                onPress={this.handlePressedResetCalibration}
                                style={{ minWidth: '100%' }}>
                                校准
                            </X.Button>
                        </X.TableCell>
                    </X.Table>
                    <X.Table>
                        {/* <X.TableCell
                            title='Paired'
                            value={ isPaired ? 'Yes' : 'No' } /> */}
                        <X.TableCell
                            title='ID'
                            value={dongleId} />
                        <X.TableCell
                            title='序列号'
                            value={serialNumber} />
                        <X.TableCell
                            title='剩余空间'
                            value={parseInt(freeSpace) + '%'}
                        />
                        <X.TableCell
                            title='上传速度'
                            value={txSpeedKbps + ' kbps'}
                        />
                    </X.Table>
                    <X.Table color='darkBlue'>
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={() => this.props.reboot()}>
                            重启
                        </X.Button>
                        <X.Line color='transparent' size='tiny' spacing='mini' />
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={() => this.props.shutdown()}>
                            关机
                        </X.Button>
                    </X.Table>
                </ScrollView>
            </View>
        )
    }

    renderNetworkSettings() {
        const { expandedCell } = this.state;
        return (
            <View style={Styles.settings}>
                <View style={Styles.settingsHeader}>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={() => this.handlePressedBack()}>
                        {'<  网络设置'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={Styles.settingsWindow}>
                    <X.Line color='transparent' spacing='tiny' />
                    <X.Table spacing='big' color='darkBlue'>
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={this.props.openWifiSettings}>
                            无线局域网
                        </X.Button>
                        <X.Line color='transparent' size='tiny' spacing='mini' />
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={ this.props.openTetheringSettings }>
                            热点设置
                        </X.Button>
                    </X.Table>
                </ScrollView>
            </View>
        )
    }

    renderDeveloperSettings() {
        const {
            isSshEnabled,
            params: {
                Version: version,
                GitBranch: gitBranch,
                GitCommit: gitRevision,
                Passive: isPassive,
                PandaFirmwareHex: pandaFirmwareHex,
                PandaDongleId: pandaDongleId,
                CommunityFeaturesToggle: communityFeatures,
                WepilotIsSimpleModel: isSimpleModel,
                WepilotEnableLogger: wepilotEnableLogger,
                WepilotDrawUI: wepilotDrawUI,
            },
        } = this.props;
        const { expandedCell } = this.state;
        const software = !!parseInt(isPassive) ? 'chffrplus' : 'wepilot';
        return (
            <View style={Styles.settings}>
                <View style={Styles.settingsHeader}>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={() => this.handlePressedBack()}>
                        {'<  开发调试设置'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={Styles.settingsWindow}>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='switch'
                            // title='Enable Community Features'
                            title='启用测试版的功能'
                            value={!!parseInt(communityFeatures)}
                            iconSource={Icons.developer}
                            descriptionExtra={
                                //   <X.Text color='white' size='tiny'>
                                //       Use features from the open source community that are not maintained or supported by comma.ai and have not been confirmed to meet the standard safety model. Be extra cautious when using these features:{'\n'}
                                //       * GM car port{'\n'}
                                //       * Toyota with DSU unplugged{'\n'}
                                //       * Pedal interceptor{'\n'}
                                //   </X.Text>
                                <X.Text color='white' size='tiny'>
                                    使用测试中的功能，可能不稳定。
                              </X.Text>
                            }
                            isExpanded={expandedCell == 'communityFeatures'}
                            handleExpanded={() => this.handleExpanded('communityFeatures')}
                            handleChanged={this.props.setCommunityFeatures} />
                            <X.TableCell
                            type='switch'
                            title='simple model'
                            value={ !!parseInt(isSimpleModel) }
                            iconSource={ Icons.developer }
                            description='simple mode'
                            isExpanded={ expandedCell == 'simple_mode' }
                            handleExpanded={ () => this.handleExpanded('simple_mode') }
                            handleChanged={this.props.setWepilotSimpleMode} />
                          <X.TableCell
                            type='switch'
                            title='允许记录日志'
                            value={ !!parseInt(wepilotEnableLogger) }
                            iconSource={ Icons.developer }
                            description='允许记录日志'
                            isExpanded={ expandedCell == 'allow_logger' }
                            handleExpanded={ () => this.handleExpanded('allow_logger') }
                            handleChanged={this.props.setAllowLogger} />
                          <X.TableCell
                            type='switch'
                            title='UI'
                            value={ !!parseInt(wepilotDrawUI) }
                            iconSource={ Icons.developer }
                            description='UI'
                            isExpanded={ expandedCell == 'allow_ui' }
                            handleExpanded={ () => this.handleExpanded('allow_ui') }
                            handleChanged={ this.props.setAllowUI } />
                        {/* <X.TableCell
                            type='switch'
                            title='enable SSH'
                            value={ isSshEnabled }
                            iconSource={ Icons.developer }
                            description='Allow devices to connect to your device using Secure Shell (SSH).'
                            isExpanded={ expandedCell == 'ssh' }
                            handleExpanded={ () => this.handleExpanded('ssh') }
                            handleChanged={ this.props.setSshEnabled } />
                        <X.TableCell
                            iconSource={ Icons.developer }
                            title='Authorized SSH Keys'
                            descriptionExtra={ this.renderSshInput() }
                            isExpanded={ expandedCell === 'ssh_keys' }
                            handleExpanded={ this.toggleExpandGithubInput }
                            type='custom'>
                            <X.Button
                                size='tiny'
                                color='settingsDefault'
                                onPress={ this.toggleExpandGithubInput }
                                style={ { minWidth: '100%' } }>
                                { expandedCell === 'ssh_keys' ? 'Cancel' : 'Edit' }
                            </X.Button>
                        </X.TableCell> */}
                    </X.Table>
                    <X.Table spacing='none'>
                        <X.TableCell
                            title='Version'
                            value={`${software} v${version}`} />
                        {/* <X.TableCell
                            title='Git Branch'
                            value={ gitBranch } />
                        <X.TableCell
                            title='Git Revision'
                            value={ gitRevision.slice(0, 12) }
                            valueTextSize='tiny' /> */}
                        <X.TableCell
                            title='Firmware'
                            value={pandaFirmwareHex != null ? pandaFirmwareHex : 'N/A'}
                            valueTextSize='tiny' />
                        <X.TableCell
                            title='ID'
                            value={(pandaDongleId != null && pandaDongleId != "unprovisioned") ? pandaDongleId : 'N/A'}
                            valueTextSize='tiny' />
                    </X.Table>
                    {/* <X.Table color='darkBlue' padding='big'>
                        <X.Button
                            color='settingsDefault'
                            size='small'
                            onPress={this.props.uninstall}>
                            {`Uninstall ${software}`}
                        </X.Button>
                    </X.Table> */}
                </ScrollView>
            </View>
        )
    }

    renderSshInput() {
        let { githubUsername, authKeysUpdateState } = this.state;
        let githubUsernameIsValid = githubUsername.match(/[a-zA-Z0-9-]+/) !== null;

        return (
            <View>
                <X.Text color='white' size='tiny'>
                    WARNING:
                    {'\n'}
                    This grants SSH access to all public keys in your GitHub settings.
                    {'\n'}
                    Never enter a GitHub username other than your own.
                    {'\n'}
                    The built-in SSH key will be disabled if you proceed.
                    {'\n'}
                    A comma employee will never ask you to add their GitHub.
                    {'\n'}
                </X.Text>
                <View style={Styles.githubUsernameInputContainer}>
                    <X.Text
                        color='white'
                        weight='semibold'
                        size='small'
                        style={Styles.githubUsernameInputLabel}>
                        GitHub Username
                    </X.Text>
                    <TextInput
                        style={Styles.githubUsernameInput}
                        onChangeText={(text) => this.setState({ githubUsername: text, authKeysUpdateState: null })}
                        value={githubUsername}
                        ref={ref => this.githubInput = ref}
                        underlineColorAndroid='transparent'
                    />
                </View>
                <View>
                    <X.Button
                        size='tiny'
                        color='settingsDefault'
                        isDisabled={!githubUsernameIsValid}
                        onPress={this.writeSshKeys}
                        style={Styles.githubUsernameSaveButton}>
                        <X.Text color='white' size='small' style={Styles.githubUsernameInputSave}>Save</X.Text>
                    </X.Button>
                    {authKeysUpdateState !== null &&
                        <View style={Styles.githubUsernameInputStatus}>
                            {authKeysUpdateState === 'inflight' &&
                                <ActivityIndicator
                                    color='white'
                                    refreshing={true}
                                    size={37}
                                    style={Styles.connectingIndicator} />
                            }
                            {authKeysUpdateState === 'failed' &&
                                <X.Text color='white' size='tiny'>Save failed. Ensure that your username is correct and you are connected to the internet.</X.Text>
                            }
                        </View>
                    }
                    <View style={Styles.githubSshKeyClearContainer}>
                        <X.Button
                            size='tiny'
                            color='settingsDefault'
                            onPress={this.clearSshKeys}
                            style={Styles.githubUsernameSaveButton}>
                            <X.Text color='white' size='small' style={Styles.githubUsernameInputSave}>Remove all</X.Text>
                        </X.Button>
                    </View>
                </View>
            </View>
        );
    }

    toggleExpandGithubInput() {
        this.setState({ authKeysUpdateState: null });
        this.handleExpanded('ssh_keys');
    }

    clearSshKeys() {
        ChffrPlus.resetSshKeys();
    }

    async writeSshKeys() {
        let { githubUsername } = this.state;

        try {
            this.setState({ authKeysUpdateState: 'inflight' })
            const resp = await fetch(`https://github.com/${githubUsername}.keys`);
            const githubKeys = (await resp.text());
            if (resp.status !== 200) {
                throw new Error('Non-200 response code from GitHub');
            }

            await ChffrPlus.writeParam(Params.KEY_GITHUB_SSH_KEYS, githubKeys);
            this.toggleExpandGithubInput();
        } catch (err) {
            console.log(err);
            this.setState({ authKeysUpdateState: 'failed' });
        }
    }

    renderSettingsByRoute() {
        const { route } = this.state;
        switch (route) {
            case SettingsRoutes.PRIMARY:
                return this.renderPrimarySettings();
            case SettingsRoutes.ACCOUNT:
                return this.renderAccountSettings();
            case SettingsRoutes.DEVICE:
                return this.renderDeviceSettings();
            case SettingsRoutes.NETWORK:
                return this.renderNetworkSettings();
            case SettingsRoutes.DEVELOPER:
                return this.renderDeveloperSettings();
        }
    }

    render() {
        return (
            <X.Gradient color='dark_blue'>
                {this.renderSettingsByRoute()}
            </X.Gradient>
        )
    }
}

const mapStateToProps = state => ({
    isSshEnabled: state.host.isSshEnabled,
    serialNumber: state.host.serial,
    simState: state.host.simState,
    wifiState: state.host.wifiState,
    isPaired: state.host.device && state.host.device.is_paired,

    // Uploader
    txSpeedKbps: parseInt(state.uploads.txSpeedKbps),
    freeSpace: state.host.thermal.freeSpace,

    params: state.params.params,
});

const mapDispatchToProps = dispatch => ({
    dispatch,
    navigateHome: async () => {
        await dispatch(updateSidebarCollapsed(false));
        await dispatch(resetToLaunch());
        await ChffrPlus.emitHomePress();
    },
    openPairing: () => {
        dispatch(NavigationActions.navigate({ routeName: 'SetupQr' }));
    },
    openWifiSettings: async () => {
        await dispatch(updateSidebarCollapsed(true));
        await dispatch(NavigationActions.navigate({ routeName: 'SettingsWifi' }));
        ChffrPlus.emitSidebarCollapsed();
    },
    openTetheringSettings: async () => {
        await dispatch(updateSidebarCollapsed(true));
        ChffrPlus.emitSidebarCollapsed();
        ChffrPlus.openTetheringSettings();
    },
    reboot: () => {
        Alert.alert('Reboot', 'Are you sure you want to reboot?', [
            { text: 'Cancel', onPress: () => { }, style: 'cancel' },
            { text: 'Reboot', onPress: () => ChffrPlus.reboot() },
        ]);
    },
    shutdown: () => {
        Alert.alert('Power Off', 'Are you sure you want to shutdown?', [
            { text: 'Cancel', onPress: () => { }, style: 'cancel' },
            { text: 'Shutdown', onPress: () => ChffrPlus.shutdown() },
        ]);
    },
    uninstall: () => {
        Alert.alert('Uninstall', 'Are you sure you want to uninstall?', [
            { text: 'Cancel', onPress: () => { }, style: 'cancel' },
            { text: 'Uninstall', onPress: () => ChffrPlus.writeParam(Params.KEY_DO_UNINSTALL, "1") },
        ]);
    },
    openTrainingGuide: () => {
        dispatch(NavigationActions.reset({
            index: 0,
            key: null,
            actions: [
                NavigationActions.navigate({ routeName: 'Onboarding' })
            ]
        }))
    },
    setOpenpilotEnabled: (openpilotEnabled) => {
        dispatch(updateParam(Params.KEY_OPENPILOT_ENABLED, (openpilotEnabled | 0).toString()));
    },
    setMetric: (useMetricUnits) => {
        dispatch(updateParam(Params.KEY_IS_METRIC, (useMetricUnits | 0).toString()));
    },
    setRecordFront: (recordFront) => {
        dispatch(updateParam(Params.KEY_RECORD_FRONT, (recordFront | 0).toString()));
    },
    setSshEnabled: (isSshEnabled) => {
        dispatch(updateSshEnabled(!!isSshEnabled));
    },
    setHasLongitudinalControl: (hasLongitudinalControl) => {
        dispatch(updateParam(Params.KEY_HAS_LONGITUDINAL_CONTROL, (hasLongitudinalControl | 0).toString()));
    },
    setLimitSetSpeed: (limitSetSpeed) => {
        dispatch(updateParam(Params.KEY_LIMIT_SET_SPEED, (limitSetSpeed | 0).toString()));
    },
    setSpeedLimitOffset: (speedLimitOffset) => {
        dispatch(updateParam(Params.KEY_SPEED_LIMIT_OFFSET, (speedLimitOffset).toString()));
    },
    setCommunityFeatures: (communityFeatures) => {
        if (communityFeatures == 1) {
            Alert.alert('启用测试版功能', '测试版功能可能包含一些未完整通过测试的功能模块，请小心使用。', [
                { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                {
                    text: 'Enable', onPress: () => {
                        dispatch(updateParam(Params.KEY_COMMUNITY_FEATURES, (communityFeatures | 0).toString()));
                    }
                },
            ]);
        } else {
            dispatch(updateParam(Params.KEY_COMMUNITY_FEATURES, (communityFeatures | 0).toString()));
        }
    },
    setLaneDepartureWarningEnabled: (isLaneDepartureWarningEnabled) => {
        dispatch(updateParam(Params.KEY_LANE_DEPARTURE_WARNING_ENABLED, (isLaneDepartureWarningEnabled | 0).toString()));
    },
    setDriverMonitoringEnabled: (isDMEnabled) => {
        dispatch(updateParam(Params.KEY_DRIVER_MONITOR_ENABLED, (isDMEnabled | 0).toString()));
    },
    setWepilotSimpleMode: (isSimpleModel) => {
        dispatch(updateParam(Params.KEY_WEPILOT_SIMPLE_MODEL, (isSimpleModel | 0).toString()));
    },
    setAllowLogger: (allowLogger) => {
        dispatch(updateParam(Params.KEY_WEPILOT_ENABLE_LOGGER, (allowLogger | 0).toString()));
    },
    setAllowUI: (allowUI) => {
        dispatch(updateParam(Params.KEY_WEPILOT_DRAW_UI, (allowUI | 0).toString()));
    },
    setLaneChangeEnabled: (laneChangeEnabled) => {
        dispatch(updateParam(Params.KEY_LANE_CHANGE_ENABLED, (laneChangeEnabled | 0).toString()));
    },
    deleteParam: (param) => {
        dispatch(deleteParam(param));
    },
    refreshParams: () => {
        dispatch(refreshParams());
    },
    handleSidebarCollapsed: async () => {
        await dispatch(updateSidebarCollapsed(true));
        ChffrPlus.emitSidebarCollapsed();
    },
    handleSidebarExpanded: async () => {
        await dispatch(updateSidebarCollapsed(false));
        ChffrPlus.emitSidebarExpanded();
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
