#!/bin/sh

SCRIPT_FILE=$0
TOPDIR=${SCRIPT_FILE%/*}
cd $TOPDIR
TOPDIR=`pwd`

cd /system/workdir/
. ./evn_amlogic.sh
cd $TOPDIR

UART_TEST_TOOL=uart_test
FACTORY_GPIO_TOOL=factory_gpio

result=0
#				in out in out in out.....
#GPIO_ALL_INDEX="3 91 86 81 87 79 88 89 20 90 92 94 93 18 19 17 80 83"

GPIO_ALL_INDEX="GPIOAO_3 GPIOY_11 GPIOY_6 GPIOY_1 GPIOY_7 GPIODV_29 GPIOY_8 GPIOY_9 GPIOH_6 GPIOY_10 GPIOY_12 GPIOY_14 GPIOY_13 GPIOH_4 GPIOH_5 GPIOH_3 GPIOY_0 GPIOY_3"

left_shift()
{
	BASE_INDEX=$2
	RETURN_DATA=$1
	
	while [ $BASE_INDEX -gt 0 ]; do
		RETURN_DATA=`$EXPR_TOOL $RETURN_DATA \* 2`
		BASE_INDEX=$(($BASE_INDEX - 1))
	done

	printf "%d" $RETURN_DATA
}

right_shift()
{
	BASE_INDEX=$2
	RETURN_DATA=$1
	
	while [ $BASE_INDEX -gt 0 ]; do
		RETURN_DATA=`$EXPR_TOOL $RETURN_DATA / 2` #$(($RETURN_DATA / 2))
		BASE_INDEX=$(($BASE_INDEX - 1))
	done
	
	printf "%d" $RETURN_DATA
}

dec2hex()
{
	DEC_TEXT=$1
	printf "%x" $DEC_TEXT
}

hex2dec()
{
	DEC_TEXT=$1
	printf "%d" $DEC_TEXT
}

parse_read_string()
{
	READ_STR="$1"
	READ_STR="${READ_STR:18}"
	printf "%d" "0x""$READ_STR"
}

set_gpio_output()
{
	local GPIO_OUTPUT_INDEX=$1
	local GPIO_OUTPUT_LEVEL=$2

	echo "$GPIO_OUTPUT_INDEX" > /sys/class/gpio/export
	#set output
	echo "out" > /sys/class/gpio/gpio$GPIO_OUTPUT_INDEX/direction
	#set level
	echo "$GPIO_OUTPUT_LEVEL" > /sys/class/gpio/gpio$GPIO_OUTPUT_INDEX/value
	echo "$GPIO_OUTPUT_INDEX" > /sys/class/gpio/unexport
}

get_pin_level()
{
	local GPIO_INPUT_INDEX=$1
	local GPIO_INPUT_LEVEL=0
	
	echo "$GPIO_INPUT_INDEX" > /sys/class/gpio/export
	#set input
	echo "in" > /sys/class/gpio/gpio$GPIO_INPUT_INDEX/direction
	#get level
	GPIO_INPUT_LEVEL=`cat /sys/class/gpio/gpio$GPIO_INPUT_INDEX/value`
	echo "$GPIO_INPUT_INDEX" > /sys/class/gpio/unexport
	
	printf "%d" $GPIO_INPUT_LEVEL
}

compare_gpio()
{
	local GPIO_OUTPUT_INDEX=$1
	local GPIO_INPUT_INDEX=$2
	local GPIO_INPUT_LEVEL=0
	
	echo "$GPIO_INPUT_INDEX" > /sys/class/gpio/export
	#set input
	echo "in" > /sys/class/gpio/gpio$GPIO_INPUT_INDEX/direction
	
	echo "$GPIO_OUTPUT_INDEX" > /sys/class/gpio/export
	#set output
	echo "out" > /sys/class/gpio/gpio$GPIO_OUTPUT_INDEX/direction
	#set level to high
	echo "1" > /sys/class/gpio/gpio$GPIO_OUTPUT_INDEX/value
	
	#GPIO_INPUT_LEVEL=$(get_pin_level $GPIO_INPUT_INDEX)
	GPIO_INPUT_LEVEL=`cat /sys/class/gpio/gpio$GPIO_INPUT_INDEX/value`
	if [ "$GPIO_INPUT_LEVEL" = "0" ]; then
		echo "$GPIO_INPUT_INDEX" > /sys/class/gpio/unexport
		echo "$GPIO_OUTPUT_INDEX" > /sys/class/gpio/unexport
		return 1
	fi
	
	#set level to low
	echo "0" > /sys/class/gpio/gpio$GPIO_OUTPUT_INDEX/value
	#GPIO_INPUT_LEVEL=$(get_pin_level $GPIO_INPUT_INDEX)
	GPIO_INPUT_LEVEL=`cat /sys/class/gpio/gpio$GPIO_INPUT_INDEX/value`
	echo "$GPIO_INPUT_INDEX" > /sys/class/gpio/unexport
	
	if [ "$GPIO_INPUT_LEVEL" = "1" ]; then
		echo "$GPIO_OUTPUT_INDEX" > /sys/class/gpio/unexport
		return 2
	fi
	
	echo "$GPIO_OUTPUT_INDEX" > /sys/class/gpio/unexport
	return 0
}

init_gpio()
{
	for index in $GPIO_ALL_INDEX; do
		echo "$index" > /sys/class/gpio/export
	done
}

compare_gpio_short()
{
	local GPIO_OUTPUT_INDEX=$1
	local GPIO_INPUT_INDEX=$2
	local GPIO_INPUT_LEVEL=0
	local GPIO_LEVEL_CORRECT_ARRAY=""
	local GPIO_IN_INDEX=0
	local GPIO_TEST_RESULT=0
	
	for GPIO_IN_INDEX in $GPIO_ALL_INDEX; do
		if [ "$GPIO_IN_INDEX" != "$GPIO_OUTPUT_INDEX" ]; then
			echo "in" > /sys/class/gpio/gpio$GPIO_IN_INDEX/direction
		fi
	done

	echo "out" > /sys/class/gpio/gpio$GPIO_OUTPUT_INDEX/direction
	echo "1" > /sys/class/gpio/gpio$GPIO_OUTPUT_INDEX/value
	for GPIO_IN_INDEX in $GPIO_ALL_INDEX; do
		if [ "$GPIO_IN_INDEX" != "$GPIO_OUTPUT_INDEX" ]; then
			GPIO_INPUT_LEVEL=`cat /sys/class/gpio/gpio$GPIO_IN_INDEX/value`
			if [ "$GPIO_INPUT_LEVEL" == "1" ]; then
				GPIO_LEVEL_CORRECT_ARRAY="$GPIO_LEVEL_CORRECT_ARRAY"" $GPIO_IN_INDEX"
			fi
		fi
	done
	
	echo -n "correct array is: "
	echo $GPIO_LEVEL_CORRECT_ARRAY
	
	echo "0" > /sys/class/gpio/gpio$GPIO_OUTPUT_INDEX/value
	for GPIO_IN_INDEX in $GPIO_ALL_INDEX; do
		if [ "$GPIO_IN_INDEX" != "$GPIO_OUTPUT_INDEX" ]; then
			GPIO_INPUT_LEVEL=`cat /sys/class/gpio/gpio$GPIO_IN_INDEX/value`
			if [ "$GPIO_INPUT_LEVEL" == "0" ]; then
				if [ $GPIO_LEVEL_CORRECT_ARRAY == *$GPIO_IN_INDEX* ]; then
					if [ "$GPIO_INPUT_INDEX" == "GPIO_IN_INDEX" ]; then
						echo "GPIO $GPIO_IN_INDEX and $GPIO_OUTPUT_INDEX test ok"
						if [ $GPIO_TEST_RESULT -eq 0 ]; then
							GPIO_TEST_RESULT = 1
						fi
					else
						echo "GPIO $GPIO_IN_INDEX is short to $GPIO_OUTPUT_INDEX, test fail"
						GPIO_TEST_RESULT=2
					fi
				fi
			fi
		fi
	done
	
	return $GPIO_TEST_RESULT
}

test_gpio_2()
{
	local GPIO_TEST_INDEX=0
	local GPIO_LAST_INDEX=0
	local GPIO_INDEX_MOD=0
	local GPIO_INDEX_IN_ARRAY=0
	local RETURN_DATA=0
	
	for GPIO_TEST_INDEX in $GPIO_ALL_INDEX; do
		GPIO_INDEX_MOD=$(($GPIO_TEST_INDEX % 2))
		if [ $GPIO_INDEX_MOD -eq 1 ]; then
			compare_gpio_short $GPIO_TEST_INDEX $GPIO_LAST_INDEX
			if [ $? -ne 1 ]; then
				RETURN_DATA=$(($RETURN_DATA + 1))
			fi
		else
			GPIO_LAST_INDEX=$GPIO_TEST_INDEX
		fi
		
		GPIO_INDEX_IN_ARRAY=$(($GPIO_INDEX_IN_ARRAY + 1))
	done
	
	echo $RETURN_DATA
	return $RETURN_DATA
}

test_gpio()
{
	local RETURN_DATA=0
	
	#GPIOAO_3, GPIOY_11
	compare_gpio 3 91
	if [ $? -ne 0 ]; then
		echo "GPIOAO_3 and GPIOY_11 test fail"
		RETURN_DATA=$(($RETURN_DATA + 1))
	fi
	
	#UART1_TX, UART1_RX
	#compare_gpio 74 75
	#if [ $? -ne 0 ]; then
	#	echo "UART1_TX and UART1_RX test fail"
	#	RETURN_DATA=$(($RETURN_DATA + 1))
	#fi
	
	#GPIOY_3, GPIO1
	#compare_gpio 83 80
	#if [ $? -ne 0 ]; then
	#	echo "GPIOY_3 and GPIO1 test fail"
	#	RETURN_DATA=$(($RETURN_DATA + 1))
	#fi
	
	#GPIOY_6, GPIO3
	compare_gpio 86 81
	if [ $? -ne 0 ]; then
		echo "GPIOY_6 and GPIO3 test fail"
		RETURN_DATA=$(($RETURN_DATA + 1))
	fi
	
	#GPIOY_7, GPIO_M
	compare_gpio 87 79
	if [ $? -ne 0 ]; then
		echo "GPIOY_7 and GPIO_M test fail"
		RETURN_DATA=$(($RETURN_DATA + 1))
	fi
	
	#GPIOY_8, GPIOY_9
	compare_gpio 88 89
	if [ $? -ne 0 ]; then
		echo "GPIOY_8 and GPIOY_9 test fail"
		RETURN_DATA=$(($RETURN_DATA + 1))
	fi
	
	#GPIOH_6, GPIOY_10
	compare_gpio 20 90
	if [ $? -ne 0 ]; then
		echo "GPIOH_6 and GPIOY_10 test fail"
		RETURN_DATA=$(($RETURN_DATA + 1))
	fi
	
	#GPIOY_12, GPIOY_14
	compare_gpio 92 94
	if [ $? -ne 0 ]; then
		echo "GPIOY_12 and GPIOY_14 test fail"
		RETURN_DATA=$(($RETURN_DATA + 1))
	fi
	
	#GPIOY_13, GPIOH_4
	compare_gpio 93 18
	if [ $? -ne 0 ]; then
		echo "GPIOY_13 and GPIOH_4 test fail"
		RETURN_DATA=$(($RETURN_DATA + 1))
	fi
	
	#GPIOH_5, GPIOH_3
	compare_gpio 19 17
	if [ $? -ne 0 ]; then
		echo "GPIOH_5 and GPIOH_3 test fail"
		RETURN_DATA=$(($RETURN_DATA + 1))
	fi
	
	return $RETURN_DATA
}

test_uart()
{
	local RETURN_DATA=0
	
	#test UART1
	./uart_test $1
	if [ $? -ne 0 ]; then
		echo "GPIOAO_3 and GPIOY_8 test fail"
		RETURN_DATA=$(($RETURN_DATA + 1))
	fi
	
	return $RETURN_DATA
}

show_led()
{
	while [ 1 ]; do
		#WiFi LED(GPIO_SD)
		set_gpio_output 7 0
		#WKUP(PWM_D)
		set_gpio_output 78 0
		#MUTE(PWM_F)
		set_gpio_output 138 0
		#BT(GPIOY_10)
		set_gpio_output 90 0
		sleep 1
		#WiFi LED(GPIO_SD)
		set_gpio_output 7 1
		#WKUP(PWM_D)
		set_gpio_output 78 1
		#MUTE(PWM_F)
		set_gpio_output 138 1
		#BT(GPIOY_10)
		set_gpio_output 90 1
		sleep 1
	done
}

clean_process()
{
	killall rootApp > /dev/null 2>&1
	killall -9 asr_tts > /dev/null 2>&1
	killall multiplayer > /dev/null 2>&1
	killall iperf > /dev/null 2>&1
}

show_pass()
{
	echo  "#######################################################################"
	echo  "##                                                                   ##"
	echo  "##                 ########     ###     ######   ######              ##"
	echo  "##                 ##     ##   ## ##   ##    ## ##    ##             ##"
	echo  "##                 ##     ##  ##   ##  ##       ##                   ##"
	echo  "##                 ########  ##     ##  ######   ######              ##"
	echo  "##                 ##        #########       ##       ##             ##"
	echo  "##                 ##        ##     ## ##    ## ##    ##             ##"
	echo  "##                 ##        ##     ##  ######   ######              ##"
	echo  "##                                                                   ##"
	echo  "#######################################################################"
}

show_fail()
{
	echo  "#######################################################################"
	echo  "##                                                                   ##"
	echo  "##                 ########     ###       ##    ##                   ##"
	echo  "##                 ##          ## ##            ##                   ##"
	echo  "##                 ##         ##   ##    ####   ##                   ##"
	echo  "##                 ########  ##     ##    ##    ##                   ##"
	echo  "##                 ##        #########    ##    ##                   ##"
	echo  "##                 ##        ##     ##    ##    ##                   ##"
	echo  "##                 ##        ##     ##   ####   ########             ##"
	echo  "##                                                                   ##"
	echo  "#######################################################################"
}

main()
{
	local UART1_TEST_RESULT=0
	local DSP_I2C_TEST_RESULT=0
	clean_process

	#test UART1
	$UART_TEST_TOOL /dev/ttyS3
	UART1_TEST_RESULT=$?
	if [ $UART1_TEST_RESULT -ne 0 ]; then
		echo "UART1 test fail"
	else 
		echo "UART1 test OK"
	fi
	
	#test_gpio
	#test_gpio_2
	$FACTORY_GPIO_TOOL f1 "$GPIO_ALL_INDEX"
	GPIOTESTRESULT=$?
	if [ "$GPIOTESTRESULT" == "0" ]; then
		echo "GPIO TEST OK"
	else
		echo "GPIO TEST FAIL"
	fi
	
	if [ "$GPIOTESTRESULT" == "0" -a "$UART1_TEST_RESULT" == "0" ]; then
		show_pass
		$FACTORY_GPIO_TOOL led blink GPIOAO_7 500 &
		$FACTORY_GPIO_TOOL led blink GPIOY_10 500 &
		$FACTORY_GPIO_TOOL led blink GPIODV_28 500 &
		$FACTORY_GPIO_TOOL led blink GPIO_TEST_N 500 &
	else
		show_fail
		$FACTORY_GPIO_TOOL led blink GPIOAO_7 100 &
		$FACTORY_GPIO_TOOL led blink GPIOY_10 100 &
		$FACTORY_GPIO_TOOL led blink GPIODV_28 100 &
		$FACTORY_GPIO_TOOL led blink GPIO_TEST_N 100 &
	fi

	#smplayer /system/workdir/misc/melody.mp3 &
	#show_led
}

main
