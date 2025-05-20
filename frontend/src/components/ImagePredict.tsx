"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export const ImagePredict: React.FC = () => {
	const [preview, setPreview] = React.useState<string | ArrayBuffer | null>("");
	const [result, setResult] = React.useState<string | null>(null);
	const [confidence, setConfidence] = React.useState<number | null>(null);

	const formSchema = z.object({
		image: z
			//Rest of validations done via react dropzone
			.instanceof(File)
			.refine((file) => file.size !== 0, "Please upload an image"),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		mode: "onBlur",
		defaultValues: {
			image: new File([""], "filename"),
		},
	});

	const onDrop = React.useCallback(
		(acceptedFiles: File[]) => {
			setResult(null);
			setConfidence(null);
			const reader = new FileReader();
			try {
				reader.onload = () => setPreview(reader.result);
				reader.readAsDataURL(acceptedFiles[0]);
				form.setValue("image", acceptedFiles[0]);
				form.clearErrors("image");
			} catch (error) {
				console.error("Error reading file:", error);
				setPreview(null);
				form.resetField("image");
				form.setError("image", {
					type: "manual",
					message: "Please upload a valid image",
				});
				toast.error("Please upload a valid image");
			}
		},
		[form]
	);

	const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
		onDrop,
		maxFiles: 1,
		maxSize: 1000000,
		accept: { "image/png": [], "image/jpg": [], "image/jpeg": [] },
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setResult(null);
		setConfidence(null);
		const formData = new FormData();
		formData.append("file", values.image);

		try {
			const response = await fetch("http://localhost:5000/predict", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const msg = await response.json();
				throw new Error(msg.error || "Something went wrong");
			}

			const data = await response.json();
			setResult(data.predicted_class);
			setConfidence(data.accuracy);
		} catch (error) {
			console.log("Error submitting form:", error);
			toast.error("Error submitting form");
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Input</CardTitle>
					<CardDescription>
						Upload an image of tomato leaf to get a prediction of the disease.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="image"
								render={() => (
									<FormItem>
										<FormLabel className={`${fileRejections.length !== 0 && "text-destructive"}`}>
											<h3 className="leading-none font-semibold text-base">
												Upload your image
												<span
													className={
														form.formState.errors.image || fileRejections.length !== 0
															? "text-destructive"
															: "text-muted-foreground"
													}></span>
											</h3>
										</FormLabel>
										<FormControl>
											<div
												{...getRootProps()}
												className="mx-auto flex cursor-pointer flex-col items-center justify-center gap-y-2 rounded-lg border p-8">
												{preview && (
													<img
														src={preview as string}
														alt="Uploaded image"
														className="max-h-[400px] rounded-lg"
													/>
												)}
												<ImagePlus className={`size-32 ${preview ? "hidden" : "block"}`} />
												<Input {...getInputProps()} type="file" />
												{isDragActive ? (
													<p className="text-muted-foreground text-sm">Drop the image!</p>
												) : (
													<p className="text-muted-foreground text-sm">
														Click here or drag an image to upload it
													</p>
												)}
											</div>
										</FormControl>
										<FormMessage>
											{fileRejections.length !== 0 && (
												<p>Image must be less than 1MB and of type png, jpg, or jpeg</p>
											)}
										</FormMessage>
									</FormItem>
								)}
							/>
							<Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
								Submit
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>

			{/* Result Card */}
			{result && (
				<Card>
					<CardHeader>
						<CardTitle>Output</CardTitle>
						<CardDescription>Prediction Result</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm">
							<span className="font-semibold">Result:</span> {result}
						</p>
						<p className="text-sm">
							<span className="font-semibold">Confidence:</span>{" "}
							<span
								className={`${
									confidence! < 0.6
										? "text-red-600"
										: confidence! < 0.85
										? "text-yellow-600"
										: "text-green-600"
								}`}>
								{(confidence! * 100).toFixed(3)}%
							</span>
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
};
